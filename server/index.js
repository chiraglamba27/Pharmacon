import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { v4 as uuidv4 } from 'uuid';
import { db, initDatabase } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize database
initDatabase();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]+/g, '_');
    cb(null, `${Date.now()}-${uuidv4().slice(0, 6)}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

// Helper auth middleware
function getUserFromReq(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const raw = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf8');
    const parsed = JSON.parse(raw);
    const identifier = parsed.email || parsed.id || parsed.username;
    const user = db.prepare('SELECT email, id, name, role, avatar FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(id) = LOWER(?)').get(identifier, identifier);
    return user || null;
  } catch (e) {
    return null;
  }
}

function requireAuth(req, res, next) {
  const user = getUserFromReq(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  req.user = user;
  next();
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    const user = getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required. Please sign in.' });
    }
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        error: `Access denied. Role '${user.role}' is not authorized. Allowed: ${allowedRoles.join(', ')}`,
        userRole: user.role,
        requiredRoles: allowedRoles,
      });
    }
    req.user = user;
    next();
  };
}

function normalizeVersion(row) {
  if (!row) return null;
  return {
    ...row,
    changeSummary: row.change_summary,
    commitRef: row.commit_ref,
    deploymentUrl: row.deployment_url,
    parentVersionId: row.parent_version_id,
  };
}

function normalizeDeliverable(row) {
  if (!row) return null;
  return {
    ...row,
    versionId: row.version_id,
    versionName: row.version_name,
    fileName: row.file_name,
    fileUrl: row.file_url,
  };
}

// --------------------------------------------------------------------------
// 1. Health & Status
// --------------------------------------------------------------------------
app.get('/api/health', (_req, res) => {
  const invCount = db.prepare('SELECT COUNT(*) as count FROM inventory_items').get().count;
  const rxCount = db.prepare('SELECT COUNT(*) as count FROM prescriptions').get().count;
  const auditCount = db.prepare('SELECT COUNT(*) as count FROM audit_events').get().count;
  res.json({
    status: 'ok',
    database: 'sqlite',
    counts: { inventory: invCount, prescriptions: rxCount, audit: auditCount },
  });
});

app.get('/api/db/overview', requireAuth, requireRole(['admin', 'instructor']), (_req, res) => {
  const tableNames = [
    'users',
    'prescriptions',
    'prescription_fields',
    'inventory_items',
    'refill_requests',
    'corrections',
    'audit_events',
    'deliverables',
    'versions',
    'presentation_decks',
    'files',
  ];

  const tables = tableNames.map((name) => {
    try {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${name}`).get().count;
      const columns = db.prepare(`PRAGMA table_info(${name})`).all().map(c => c.name);
      return { name, count, columns };
    } catch {
      return { name, count: 0, columns: [] };
    }
  });

  res.json({
    dbPath: 'server/pharmacon.db',
    tables,
    totalRecords: tables.reduce((acc, t) => acc + t.count, 0),
  });
});

app.get('/api/db/table/:name', requireAuth, requireRole(['admin', 'instructor']), (req, res) => {
  const { name } = req.params;
  const allowed = [
    'users',
    'prescriptions',
    'prescription_fields',
    'inventory_items',
    'refill_requests',
    'corrections',
    'audit_events',
    'deliverables',
    'versions',
    'presentation_decks',
    'files',
  ];

  if (!allowed.includes(name)) {
    return res.status(400).json({ error: 'Invalid or restricted table name' });
  }

  try {
    const rawRows = db.prepare(`SELECT * FROM ${name} ORDER BY rowid DESC LIMIT 100`).all();
    const columns = db.prepare(`PRAGMA table_info(${name})`).all().map(c => c.name);
    const rows = rawRows.map(r => {
      const copy = { ...r };
      if (copy.password_hash) copy.password_hash = '•••••••• (Encrypted)';
      return copy;
    });
    res.json({ table: name, columns, rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------------------------------
// 2. Authentication (Google Auth & Email Primary Key)
// --------------------------------------------------------------------------
app.post('/api/auth/google', async (req, res) => {
  try {
    let email = req.body.email;
    let name = req.body.name;
    let avatar = req.body.avatar || req.body.picture || '';
    let googleId = req.body.googleId || '';
    let requestedRole = req.body.role;

    // If a Google OAuth ID Token (credential) is passed from Google Identity Services
    if (req.body.credential) {
      try {
        const tokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(req.body.credential)}`);
        if (tokenRes.ok) {
          const payload = await tokenRes.json();
          if (payload.email) {
            email = payload.email;
            name = payload.name || name;
            avatar = payload.picture || avatar;
            googleId = payload.sub || googleId;
          }
        }
      } catch (err) {
        console.warn('Google token validation fallback:', err.message);
      }
    }

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email address is required for Google Authentication' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail);

    if (!user) {
      // Determine default role for new Google user
      let role = requestedRole || 'patient';
      if (cleanEmail === 'chiraglamba@gmail.com' || cleanEmail.endsWith('@pharmacon.org')) {
        role = 'admin';
      } else if (cleanEmail.includes('doctor') || cleanEmail.includes('dr.')) {
        role = 'doctor';
      } else if (cleanEmail.includes('pharmacy') || cleanEmail.includes('pharmacist')) {
        role = 'pharmacist';
      } else if (cleanEmail.includes('clinic') || cleanEmail.includes('staff')) {
        role = 'clinic-staff';
      }

      const id = `u-${Date.now().toString(36)}`;
      const cleanName = name || cleanEmail.split('@')[0];

      db.prepare(`
        INSERT INTO users (email, id, name, role, avatar, google_id, password)
        VALUES (?, ?, ?, ?, ?, ?, 'admin123')
      `).run(cleanEmail, id, cleanName, role, avatar, googleId);

      db.prepare(`
        INSERT INTO audit_events (id, actor, role, action, entity, entity_id, status, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `AE-${uuidv4().slice(0, 8)}`,
        cleanName,
        role,
        'Google User Registered',
        'User',
        cleanEmail,
        'success',
        `New account registered with Google (${cleanEmail})`
      );

      user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail);
    } else {
      if (avatar && !user.avatar) {
        db.prepare('UPDATE users SET avatar = ? WHERE email = ?').run(avatar, user.email);
      }

      db.prepare(`
        INSERT INTO audit_events (id, actor, role, action, entity, entity_id, status, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `AE-${uuidv4().slice(0, 8)}`,
        user.name,
        user.role,
        'Google Login',
        'User',
        user.email,
        'success',
        `Signed in via Google Auth (${user.email})`
      );
    }

    const tokenPayload = { email: user.email, name: user.name, role: user.role };
    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    res.json({
      token,
      user: {
        email: user.email,
        id: user.id,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: 'Google authentication failed: ' + err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { username, email, password } = req.body;
  const identifier = String(email || username || '').trim().toLowerCase();
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email/Username and password required' });
  }

  const user = db.prepare('SELECT email, id, name, role, avatar, password FROM users WHERE LOWER(email) = ? OR LOWER(id) = ? OR LOWER(name) LIKE ?').get(identifier, identifier, `%${identifier}%`);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email/username or password' });
  }

  const tokenPayload = { email: user.email, name: user.name, role: user.role };
  const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

  res.json({
    token,
    user: { email: user.email, id: user.id, name: user.name, role: user.role, avatar: user.avatar },
  });
});

app.get('/api/auth/me', (req, res) => {
  const user = getUserFromReq(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({
    user: {
      email: user.email,
      id: user.id,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

app.post('/api/auth/logout', (_req, res) => {
  res.json({ success: true });
});

// --------------------------------------------------------------------------
// 3. Team Members
// --------------------------------------------------------------------------
app.get('/api/team', (_req, res) => {
  const members = db.prepare('SELECT * FROM team_members ORDER BY created_at ASC').all();
  res.json({ members });
});

app.put('/api/team/:id', requireRole(['admin', 'instructor']), (req, res) => {
  const { id } = req.params;
  const b = req.body;

  const current = db.prepare('SELECT * FROM team_members WHERE id = ?').get(id);
  if (!current) return res.status(404).json({ error: 'Member not found' });

  const name = b.name ?? current.name;
  const role = b.role ?? current.role;
  const focus = b.focus ?? current.focus;
  const avatar = b.avatar ?? current.avatar;
  const skills = b.skills ?? current.skills;
  const github_url = b.github_url ?? b.githubUrl ?? current.github_url;
  const linkedin_url = b.linkedin_url ?? b.linkedinUrl ?? current.linkedin_url;

  db.prepare(`
    UPDATE team_members
    SET name = ?, role = ?, focus = ?, avatar = ?, skills = ?, github_url = ?, linkedin_url = ?
    WHERE id = ?
  `).run(name, role, focus, avatar, skills, github_url, linkedin_url, id);

  const updated = db.prepare('SELECT * FROM team_members WHERE id = ?').get(id);
  res.json({ member: updated });
});

// --------------------------------------------------------------------------
// 4. Versions
// --------------------------------------------------------------------------
app.get('/api/versions', (_req, res) => {
  const rows = db.prepare('SELECT * FROM versions ORDER BY created_at DESC').all();
  res.json({ versions: rows.map(normalizeVersion) });
});

app.post('/api/versions', requireRole(['admin', 'instructor']), (req, res) => {
  const b = req.body;
  const id = b.id || `v-${Date.now().toString(36)}`;
  const status = b.status || 'current';

  if (status === 'current') {
    db.prepare("UPDATE versions SET status = 'archived' WHERE status = 'current'").run();
  }

  const changeSummary = b.changeSummary ?? b.change_summary ?? '';
  const commitRef = b.commitRef ?? b.commit_ref ?? '';
  const deploymentUrl = b.deploymentUrl ?? b.deployment_url ?? '';
  const parentVersionId = b.parentVersionId ?? b.parent_version_id ?? null;
  const fileUrl = b.fileUrl ?? b.file_url ?? '';

  db.prepare(`
    INSERT INTO versions (id, name, date, authors, status, change_summary, commit_ref, deployment_url, parent_version_id, file_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name, date=excluded.date, authors=excluded.authors,
      status=excluded.status, change_summary=excluded.change_summary,
      commit_ref=excluded.commit_ref, deployment_url=excluded.deployment_url,
      parent_version_id=excluded.parent_version_id, file_url=excluded.file_url
  `).run(
    id,
    b.name,
    b.date || new Date().toISOString().split('T')[0],
    b.authors || 'Team Pharmacon',
    status,
    changeSummary,
    commitRef,
    deploymentUrl,
    parentVersionId,
    fileUrl
  );

  const row = db.prepare('SELECT * FROM versions WHERE id = ?').get(id);
  res.json({ version: normalizeVersion(row) });
});

app.put('/api/versions/:id', requireRole(['admin', 'instructor']), (req, res) => {
  const { id } = req.params;
  const b = req.body;
  const current = db.prepare('SELECT * FROM versions WHERE id = ?').get(id);
  if (!current) return res.status(404).json({ error: 'Version not found' });

  const status = b.status ?? current.status;
  if (status === 'current') {
    db.prepare("UPDATE versions SET status = 'archived' WHERE status = 'current' AND id != ?").run(id);
  }

  const name = b.name ?? current.name;
  const date = b.date ?? current.date;
  const authors = b.authors ?? current.authors;
  const changeSummary = b.changeSummary ?? b.change_summary ?? current.change_summary;
  const commitRef = b.commitRef ?? b.commit_ref ?? current.commit_ref;
  const deploymentUrl = b.deploymentUrl ?? b.deployment_url ?? current.deployment_url;

  db.prepare(`
    UPDATE versions
    SET name=?, date=?, authors=?, status=?, change_summary=?, commit_ref=?, deployment_url=?
    WHERE id=?
  `).run(name, date, authors, status, changeSummary, commitRef, deploymentUrl, id);

  const row = db.prepare('SELECT * FROM versions WHERE id = ?').get(id);
  res.json({ version: normalizeVersion(row) });
});

// --------------------------------------------------------------------------
// 5. Deliverables
// --------------------------------------------------------------------------
app.get('/api/deliverables', (_req, res) => {
  const rows = db.prepare(`
    SELECT d.*, v.name as v_name, v.status as v_status
    FROM deliverables d
    LEFT JOIN versions v ON d.version_id = v.id
    ORDER BY d.created_at DESC
  `).all();

  const deliverables = rows.map((r) =>
    normalizeDeliverable({
      ...r,
      version_name: r.v_name || r.version_name || '',
      version_status: r.v_status || '',
    })
  );

  res.json({ deliverables });
});

app.get('/api/deliverables/:id', (req, res) => {
  const { id } = req.params;
  const row = db.prepare(`
    SELECT d.*, v.name as v_name, v.status as v_status, v.date as v_date, v.authors as v_authors, v.change_summary as v_change_summary
    FROM deliverables d
    LEFT JOIN versions v ON d.version_id = v.id
    WHERE d.id = ?
  `).get(id);

  if (!row) return res.status(404).json({ error: 'Deliverable not found' });

  const history = db.prepare(`
    SELECT id, title, date, status, version_name
    FROM deliverables
    WHERE id != ?
    ORDER BY created_at DESC
  `).all(id);

  const deliverable = {
    ...row,
    version_name: row.v_name || row.version_name,
    version_status: row.v_status || null,
    version_date: row.v_date || null,
    version_authors: row.v_authors || null,
    version_change_summary: row.v_change_summary || null,
  };

  res.json({ deliverable: normalizeDeliverable(deliverable), history });
});

app.post('/api/deliverables', requireRole(['admin', 'instructor']), (req, res) => {
  const b = req.body;
  const id = b.id || `deliv-${Date.now().toString(36)}`;

  let versionName = b.versionName ?? b.version_name ?? '';
  const versionId = b.versionId ?? b.version_id ?? null;
  if (versionId) {
    const v = db.prepare('SELECT name FROM versions WHERE id = ?').get(versionId);
    if (v) versionName = v.name;
  }

  let fileName = b.fileName ?? b.file_name ?? null;
  let fileUrl = b.fileUrl ?? b.file_url ?? null;
  const fileId = b.fileId ?? b.file_id ?? null;

  if (fileId) {
    const f = db.prepare('SELECT original_name, file_url FROM files WHERE id = ?').get(fileId);
    if (f) {
      fileName = f.original_name;
      fileUrl = f.file_url;
    }
  }

  db.prepare(`
    INSERT INTO deliverables (id, title, type, version_id, version_name, date, status, description, file_id, file_name, file_url, authors)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title=excluded.title, type=excluded.type, version_id=excluded.version_id,
      version_name=excluded.version_name, date=excluded.date, status=excluded.status,
      description=excluded.description, file_id=excluded.file_id,
      file_name=excluded.file_name, file_url=excluded.file_url, authors=excluded.authors
  `).run(
    id,
    b.title,
    b.type || 'Interactive Presentation',
    versionId,
    versionName,
    b.date || new Date().toISOString().split('T')[0],
    b.status || 'published',
    b.description || '',
    fileId,
    fileName,
    fileUrl,
    b.authors || 'Team Pharmacon'
  );

  const row = db.prepare('SELECT * FROM deliverables WHERE id = ?').get(id);
  res.json({ deliverable: normalizeDeliverable(row) });
});

app.put('/api/deliverables/:id', requireRole(['admin', 'instructor']), (req, res) => {
  const { id } = req.params;
  const b = req.body;
  const current = db.prepare('SELECT * FROM deliverables WHERE id = ?').get(id);
  if (!current) return res.status(404).json({ error: 'Deliverable not found' });

  const title = b.title ?? current.title;
  const type = b.type ?? current.type;
  const versionId = b.versionId ?? b.version_id ?? current.version_id;
  let versionName = current.version_name;
  if (versionId) {
    const v = db.prepare('SELECT name FROM versions WHERE id = ?').get(versionId);
    if (v) versionName = v.name;
  }
  const date = b.date ?? current.date;
  const status = b.status ?? current.status;
  const description = b.description ?? current.description;
  const fileName = b.fileName ?? b.file_name ?? current.file_name;
  const fileUrl = b.fileUrl ?? b.file_url ?? current.file_url;

  db.prepare(`
    UPDATE deliverables
    SET title=?, type=?, version_id=?, version_name=?, date=?, status=?, description=?, file_name=?, file_url=?
    WHERE id=?
  `).run(title, type, versionId, versionName, date, status, description, fileName, fileUrl, id);

  const row = db.prepare('SELECT * FROM deliverables WHERE id = ?').get(id);
  res.json({ deliverable: normalizeDeliverable(row) });
});

app.delete('/api/deliverables/:id', requireRole(['admin', 'instructor']), (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM deliverables WHERE id = ?').run(id);
  res.json({ success: true });
});

// --------------------------------------------------------------------------
// 6. Formulary Inventory
// --------------------------------------------------------------------------
app.get('/api/inventory', (_req, res) => {
  const rows = db.prepare('SELECT * FROM inventory_items ORDER BY medicine ASC').all();
  const items = rows.map((r) => ({
    id: r.id,
    medicine: r.medicine,
    strength: r.strength,
    dosageForm: r.dosage_form,
    sku: r.sku,
    packSize: r.pack_size,
    stock: r.stock,
    reorderLevel: r.reorder_level,
    lastUpdated: r.updated_at,
    status: r.stock === 0 ? 'out-of-stock' : r.stock <= r.reorder_level ? 'low-stock' : 'in-stock',
  }));
  res.json({ items });
});

app.post('/api/inventory', requireRole(['pharmacist', 'admin']), (req, res) => {
  const b = req.body;
  const id = b.id || `INV-${Date.now().toString(36).toUpperCase()}`;
  const sku = b.sku || `${b.medicine.slice(0, 3).toUpperCase()}-${b.strength.replace(/\s+/g, '')}`;

  db.prepare(`
    INSERT INTO inventory_items (id, medicine, strength, dosage_form, sku, pack_size, stock, reorder_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    b.medicine,
    b.strength,
    b.dosageForm || b.dosage_form || 'Tablet',
    sku,
    b.packSize || b.pack_size || '100 tabs',
    Number(b.stock) || 0,
    Number(b.reorderLevel ?? b.reorder_level) || 10
  );

  db.prepare(`
    INSERT INTO audit_events (id, actor, role, action, entity, entity_id, status, details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `AE-${uuidv4().slice(0, 8)}`,
    'Pharmacist',
    'pharmacist',
    'Inventory added',
    'Inventory',
    id,
    'success',
    `Added ${b.medicine} (${b.strength}) - Stock: ${b.stock}`
  );

  const row = db.prepare('SELECT * FROM inventory_items WHERE id = ?').get(id);
  res.json({ item: row, success: true });
});

app.put('/api/inventory/:id', requireRole(['pharmacist', 'admin']), (req, res) => {
  const { id } = req.params;
  const b = req.body;
  const current = db.prepare('SELECT * FROM inventory_items WHERE id = ?').get(id);
  if (!current) return res.status(404).json({ error: 'Item not found' });

  const stock = b.stock !== undefined ? Number(b.stock) : current.stock;
  const reorderLevel = b.reorderLevel !== undefined || b.reorder_level !== undefined
    ? Number(b.reorderLevel ?? b.reorder_level)
    : current.reorder_level;
  const medicine = b.medicine ?? current.medicine;
  const strength = b.strength ?? current.strength;
  const dosageForm = b.dosageForm ?? b.dosage_form ?? current.dosage_form;
  const packSize = b.packSize ?? b.pack_size ?? current.pack_size;

  db.prepare(`
    UPDATE inventory_items
    SET stock = ?, reorder_level = ?, medicine = ?, strength = ?, dosage_form = ?, pack_size = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(stock, reorderLevel, medicine, strength, dosageForm, packSize, id);

  if (stock !== current.stock) {
    db.prepare(`
      INSERT INTO audit_events (id, actor, role, action, entity, entity_id, status, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `AE-${uuidv4().slice(0, 8)}`,
      'System',
      'System',
      'Inventory stock adjusted',
      'Inventory',
      id,
      'success',
      `Stock changed from ${current.stock} to ${stock} for ${medicine}`
    );
  }

  const updated = db.prepare('SELECT * FROM inventory_items WHERE id = ?').get(id);
  res.json({ item: updated, success: true });
});

// --------------------------------------------------------------------------
// 7. Prescriptions & OCR Workflow
// --------------------------------------------------------------------------
app.get('/api/prescriptions', (req, res) => {
  const { status, patientId, doctor } = req.query;
  let sql = 'SELECT * FROM prescriptions WHERE 1=1';
  const params = [];
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (patientId) {
    sql += ' AND (patient_id = ? OR LOWER(patient_name) LIKE ?)';
    params.push(patientId, `%${patientId.toLowerCase()}%`);
  }
  if (doctor) {
    sql += ' AND LOWER(doctor_name) LIKE ?';
    params.push(`%${doctor.toLowerCase()}%`);
  }
  sql += ' ORDER BY created_at DESC';

  const prescriptions = db.prepare(sql).all(...params);

  const result = prescriptions.map((p) => {
    const fields = db.prepare(`
      SELECT id, label, value, confidence, needs_verification
      FROM prescription_fields
      WHERE prescription_id = ?
    `).all(p.id);
    return { ...p, fields };
  });

  res.json({ prescriptions: result });
});

app.get('/api/prescriptions/:patientId', (req, res) => {
  const { patientId } = req.params;
  const prescriptions = db.prepare(`
    SELECT * FROM prescriptions
    WHERE patient_id = ? OR id = ? OR LOWER(patient_name) LIKE ?
    ORDER BY created_at DESC
  `).all(patientId, patientId, `%${patientId.toLowerCase()}%`);

  const result = prescriptions.map((p) => {
    const fields = db.prepare(`
      SELECT id, label, value, confidence, needs_verification
      FROM prescription_fields
      WHERE prescription_id = ?
    `).all(p.id);
    return { ...p, fields };
  });

  res.json({ prescriptions: result });
});

app.post('/api/prescriptions', requireRole(['doctor', 'admin', 'clinic-staff']), (req, res) => {
  const b = req.body;
  const id = b.id || `RX-${Date.now().toString(36).toUpperCase()}`;
  const patientId = b.patient_id || b.patientId || 'PT-1001';
  const patientName = b.patient_name || b.patientName || 'Rahul Kumar';
  const doctorName = b.doctor_name || b.doctorName || 'Dr. A. Sharma';
  const status = b.status || 'confirmed';

  db.prepare(`
    INSERT INTO prescriptions (id, patient_id, patient_name, doctor_name, status)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, patientId, patientName, doctorName, status);

  let medicineName = 'Medication';
  if (Array.isArray(b.fields)) {
    const insertField = db.prepare(`
      INSERT INTO prescription_fields (prescription_id, label, value, confidence, needs_verification)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const f of b.fields) {
      if (f.label?.toLowerCase().includes('med') || f.label?.toLowerCase().includes('name')) {
        medicineName = f.value;
      }
      insertField.run(id, f.label, f.value, Number(f.confidence) || 95, f.needs_verification || f.needsVerification ? 1 : 0);
    }
  }

  // If status is confirmed, deduct inventory for matched medicine if found
  if (status === 'confirmed') {
    const invMatch = db.prepare(`
      SELECT id, medicine, stock FROM inventory_items
      WHERE LOWER(medicine) LIKE ?
      LIMIT 1
    `).get(`%${medicineName.toLowerCase().split(' ')[0]}%`);

    if (invMatch) {
      db.prepare(`
        UPDATE inventory_items
        SET stock = MAX(stock - 1, 0), updated_at = datetime('now')
        WHERE id = ?
      `).run(invMatch.id);
    }
  }

  db.prepare(`
    INSERT INTO audit_events (id, actor, role, action, entity, entity_id, status, details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `AE-${uuidv4().slice(0, 8)}`,
    doctorName,
    'doctor',
    'Prescription created and verified',
    'Prescription',
    id,
    'success',
    `Prescription ${id} for ${patientName} (${medicineName})`
  );

  const prescription = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(id);
  const fields = db.prepare('SELECT * FROM prescription_fields WHERE prescription_id = ?').all(id);

  res.json({ prescription: { ...prescription, fields } });
});

// Clinic staff or doctor field resolution
app.put('/api/prescriptions/:id/resolve-field', requireRole(['doctor', 'clinic-staff', 'admin']), (req, res) => {
  const { id } = req.params;
  const { fieldId, fieldLabel, correctedValue, originalPrediction, confidenceBefore } = req.body;
  const user = getUserFromReq(req);

  if (fieldId) {
    db.prepare(`
      UPDATE prescription_fields
      SET value = COALESCE(?, value), needs_verification = 0, confidence = 99
      WHERE id = ? AND prescription_id = ?
    `).run(correctedValue || null, fieldId, id);
  } else if (fieldLabel) {
    db.prepare(`
      UPDATE prescription_fields
      SET value = COALESCE(?, value), needs_verification = 0, confidence = 99
      WHERE label = ? AND prescription_id = ?
    `).run(correctedValue || null, fieldLabel, id);
  }

  // If there was a real correction made, log it to corrections table
  if (correctedValue && originalPrediction && correctedValue !== originalPrediction) {
    db.prepare(`
      INSERT INTO corrections (id, prescription_id, field, original_prediction, corrected_value, confidence_before, doctor_name, staff_member)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `CR-${Date.now().toString(36).toUpperCase()}`,
      id,
      fieldLabel || 'Field',
      originalPrediction,
      correctedValue,
      Number(confidenceBefore) || 82,
      'Dr. A. Sharma',
      user?.name || 'Clinic Staff'
    );
  }

  db.prepare(`
    INSERT INTO audit_events (id, actor, role, action, entity, entity_id, status, details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `AE-${uuidv4().slice(0, 8)}`,
    user?.name || 'Clinic Staff',
    user?.role || 'clinic-staff',
    'Resolved low-confidence OCR field',
    'PrescriptionField',
    id,
    'success',
    `Resolved ${fieldLabel || 'field'} on prescription ${id}`
  );

  res.json({ success: true, message: 'Field successfully verified and resolved.' });
});

// Update prescription status (e.g. from pending -> verified, or verified -> dispensed)
app.put('/api/prescriptions/:id/status', requireRole(['doctor', 'clinic-staff', 'pharmacist', 'admin']), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = getUserFromReq(req);

  const allowedStatuses = ['draft', 'pending', 'pending_review', 'confirmed', 'verified', 'dispensed'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid prescription status. Allowed: ${allowedStatuses.join(', ')}` });
  }

  const existing = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Prescription not found' });
  }

  db.prepare('UPDATE prescriptions SET status = ? WHERE id = ?').run(status, id);

  // If dispensed or confirmed, decrement matched medication stock in inventory
  if ((status === 'dispensed' || status === 'confirmed') && existing.status !== status) {
    const medField = db.prepare(`
      SELECT value FROM prescription_fields
      WHERE prescription_id = ? AND (label LIKE '%med%' OR label LIKE '%medicine%')
      LIMIT 1
    `).get(id);

    const medName = medField ? medField.value : 'Amoxicillin';
    const invMatch = db.prepare(`
      SELECT id, medicine, stock FROM inventory_items
      WHERE LOWER(medicine) LIKE ?
      LIMIT 1
    `).get(`%${medName.toLowerCase().split(' ')[0]}%`);

    if (invMatch) {
      db.prepare(`
        UPDATE inventory_items
        SET stock = MAX(stock - 1, 0), updated_at = datetime('now')
        WHERE id = ?
      `).run(invMatch.id);
    }
  }

  db.prepare(`
    INSERT INTO audit_events (id, actor, role, action, entity, entity_id, status, details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `AE-${uuidv4().slice(0, 8)}`,
    user?.name || 'Clinical Staff',
    user?.role || 'staff',
    `Prescription status set to ${status}`,
    'Prescription',
    id,
    'success',
    `Status transitioned from ${existing.status} to ${status}`
  );

  res.json({ success: true, id, status });
});

// Demo Prescription Upload (Step 1 of connected workflow)
app.post('/api/prescriptions/upload-demo', (req, res) => {
  const customId = req.body?.id;
  const sampleId = customId || `RX-DEMO-${Date.now().toString(36).toUpperCase()}`;
  const patientName = req.body?.patientName || 'Rahul Kumar';
  const medicineName = req.body?.medicine || 'Amoxicillin';
  const doctorName = req.body?.doctorName || 'Dr. Priya Sharma';

  db.prepare(`
    INSERT INTO prescriptions (id, patient_id, patient_name, doctor_name, status)
    VALUES (?, ?, ?, ?, ?)
  `).run(sampleId, 'PT-1001', patientName, doctorName, 'pending');

  const insertField = db.prepare(`
    INSERT INTO prescription_fields (prescription_id, label, value, confidence, needs_verification)
    VALUES (?, ?, ?, ?, ?)
  `);

  const fields = req.body?.fields && Array.isArray(req.body.fields)
    ? req.body.fields.map(f => [sampleId, f.label, f.value, Number(f.confidence) || 95, f.needsVerification ? 1 : 0])
    : [
        [sampleId, 'Patient Name', patientName, 99, 0],
        [sampleId, 'Medicine Generic', medicineName, 98, 0],
        [sampleId, 'Strength', '500 mg', 99, 0],
        [sampleId, 'Dosage Form', 'Capsule', 96, 0],
        [sampleId, 'Frequency / Sig', '1-0-1 (Morning & Night)', 94, 0],
        [sampleId, 'Duration', '5 days', 95, 0],
        [sampleId, 'Instructions', 'After meals with water', 92, 0],
      ];

  for (const f of fields) {
    insertField.run(...f);
  }

  db.prepare(`
    INSERT INTO audit_events (id, actor, role, action, entity, entity_id, status, details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `AE-${uuidv4().slice(0, 8)}`,
    patientName,
    'patient',
    'Prescription Uploaded',
    'Prescription',
    sampleId,
    'success',
    `Handwritten prescription scanned & queued for Doctor verification for ${patientName} (${medicineName})`
  );

  res.json({
    success: true,
    id: sampleId,
    status: 'pending',
    patientName,
    medicine: medicineName,
    message: 'Prescription uploaded and queued for Doctor review'
  });
});

// Transactional Confirm Sample Prescription (replicates confirm_sample_prescription PostgreSQL function)
app.post('/api/prescriptions/confirm-sample', requireRole(['doctor', 'admin', 'clinic-staff']), (req, res) => {
  const customId = req.body?.id;
  const sampleId = customId || `RX-VERIFIED-${Date.now().toString(36).toUpperCase()}`;
  const patientName = req.body?.patientName || 'Rahul Kumar';
  const medicineName = req.body?.medicine || 'Amoxicillin';
  const user = getUserFromReq(req);
  const doctorName = user?.name || 'Dr. A. Sharma';

  // 1. Create prescription
  db.prepare(`
    INSERT INTO prescriptions (id, patient_id, patient_name, doctor_name, status)
    VALUES (?, ?, ?, ?, ?)
  `).run(sampleId, 'PT-1001', patientName, doctorName, 'confirmed');

  // 2. Insert extracted fields
  const insertField = db.prepare(`
    INSERT INTO prescription_fields (prescription_id, label, value, confidence, needs_verification)
    VALUES (?, ?, ?, ?, ?)
  `);

  const fields = req.body?.fields && Array.isArray(req.body.fields)
    ? req.body.fields.map(f => [sampleId, f.label, f.value, Number(f.confidence) || 95, f.needsVerification ? 1 : 0])
    : [
        [sampleId, 'Medicine', medicineName, 94, 0],
        [sampleId, 'Strength', '500 mg', 97, 0],
        [sampleId, 'Dosage Form', 'Tablet', 96, 0],
        [sampleId, 'Frequency', '1-0-1', 86, 1],
        [sampleId, 'Route', 'Oral', 92, 0],
        [sampleId, 'Duration', '5 days', 91, 0],
        [sampleId, 'Instructions', 'After food', 88, 1],
      ];

  for (const f of fields) {
    insertField.run(...f);
  }

  // 3. Decrement Inventory for matched medicine
  const invMatch = db.prepare(`
    SELECT id, medicine, stock FROM inventory_items
    WHERE LOWER(medicine) LIKE ?
    LIMIT 1
  `).get(`%${medicineName.toLowerCase().split(' ')[0]}%`);

  if (invMatch) {
    db.prepare(`
      UPDATE inventory_items
      SET stock = MAX(stock - 1, 0), updated_at = datetime('now')
      WHERE id = ?
    `).run(invMatch.id);
  }

  // 4. Audit Log Entries
  db.prepare(`
    INSERT INTO audit_events (id, actor, role, action, entity, entity_id, status, details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `AE-${uuidv4().slice(0, 8)}`,
    doctorName,
    user?.role || 'doctor',
    'Prescription confirmed',
    'Prescription',
    sampleId,
    'success',
    `Prescription signed and released for ${patientName} (${medicineName})`
  );

  res.json({ prescriptionId: sampleId, alreadyConfirmed: false });
});

// Corrections API
app.get('/api/corrections', (_req, res) => {
  const list = db.prepare('SELECT * FROM corrections ORDER BY rowid DESC').all();
  res.json({
    corrections: list.map(c => ({
      id: c.id,
      prescriptionId: c.prescription_id,
      field: c.field,
      originalPrediction: c.original_prediction,
      correctedValue: c.corrected_value,
      confidenceBefore: c.confidence_before,
      doctorName: c.doctor_name,
      staffMember: c.staff_member,
      timestamp: c.timestamp,
    }))
  });
});

app.post('/api/corrections', requireRole(['doctor', 'clinic-staff', 'admin']), (req, res) => {
  const b = req.body;
  const id = b.id || `CR-${Date.now().toString(36).toUpperCase()}`;
  db.prepare(`
    INSERT INTO corrections (id, prescription_id, field, original_prediction, corrected_value, confidence_before, doctor_name, staff_member)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    b.prescriptionId || 'RX-MANUAL',
    b.field || 'Field',
    b.originalPrediction || '',
    b.correctedValue || '',
    Number(b.confidenceBefore) || 80,
    b.doctorName || 'Dr. A. Sharma',
    b.staffMember || 'Priya Desai'
  );
  res.json({ id, success: true });
});

// --------------------------------------------------------------------------
// 8. Refill Requests
// --------------------------------------------------------------------------
app.get('/api/refills', (_req, res) => {
  const rows = db.prepare('SELECT * FROM refill_requests ORDER BY requested_at DESC').all();
  const refills = rows.map((r) => ({
    id: r.id,
    prescriptionId: r.prescription_id,
    patientId: r.patient_id,
    patientName: r.patient_name,
    medicine: r.medicine,
    strength: r.strength,
    status: r.status,
    requestDate: r.requested_at,
    updatedAt: r.updated_at,
  }));
  res.json({ refills });
});

app.post('/api/refills', (req, res) => {
  const user = getUserFromReq(req);
  const id = `RF-${Date.now().toString(36).toUpperCase()}`;
  const patientId = user?.id || 'PT-1001';
  const patientName = user?.name || 'Rahul Kumar';
  const medicine = req.body.medicine || 'Amoxicillin';
  const strength = req.body.strength || '500 mg';

  db.prepare(`
    INSERT INTO refill_requests (id, prescription_id, patient_id, patient_name, medicine, strength, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, 'RX-2024-0001', patientId, patientName, medicine, strength, 'pending');

  db.prepare(`
    INSERT INTO audit_events (id, actor, role, action, entity, entity_id, status, details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `AE-${uuidv4().slice(0, 8)}`,
    patientName,
    'patient',
    'Refill requested',
    'Refill',
    id,
    'info',
    `Requested refill for ${medicine} (${strength})`
  );

  res.json({ id });
});

app.put('/api/refills/:id', requireRole(['pharmacist', 'clinic-staff', 'admin']), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['approved', 'rejected', 'contacted'].includes(status)) {
    return res.status(400).json({ error: 'Invalid refill status' });
  }

  const refill = db.prepare('SELECT * FROM refill_requests WHERE id = ?').get(id);
  if (!refill) return res.status(404).json({ error: 'Refill not found' });

  db.prepare(`
    UPDATE refill_requests
    SET status = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(status, id);

  // If approved, decrement stock of matching item
  if (status === 'approved') {
    db.prepare(`
      UPDATE inventory_items
      SET stock = MAX(stock - 1, 0), updated_at = datetime('now')
      WHERE LOWER(medicine) LIKE LOWER(?)
    `).run(`%${refill.medicine}%`);
  }

  const user = getUserFromReq(req);
  db.prepare(`
    INSERT INTO audit_events (id, actor, role, action, entity, entity_id, status, details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `AE-${uuidv4().slice(0, 8)}`,
    user?.name || 'Vikram Singh (Pharmacist)',
    user?.role || 'pharmacist',
    `Refill ${status}`,
    'Refill',
    id,
    'success',
    `Refill ${id} status changed to ${status}`
  );

  res.json({ success: true });
});

// --------------------------------------------------------------------------
// 9. Audit Events
// --------------------------------------------------------------------------
app.get('/api/audit', (_req, res) => {
  const rows = db.prepare('SELECT * FROM audit_events ORDER BY created_at DESC LIMIT 100').all();
  const events = rows.map((r) => ({
    id: r.id,
    timestamp: r.created_at,
    user: r.actor,
    role: r.role,
    action: r.action,
    entity: r.entity,
    entityId: r.entity_id,
    status: r.status,
    details: r.details,
  }));
  res.json({ events });
});

app.post('/api/audit', (req, res) => {
  const b = req.body;
  const id = b.id || `AE-${uuidv4().slice(0, 8)}`;
  db.prepare(`
    INSERT INTO audit_events (id, actor, role, action, entity, entity_id, status, details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    b.user || b.actor || 'System',
    b.role || 'system',
    b.action || 'Action recorded',
    b.entity || 'General',
    b.entityId || b.entity_id || '',
    b.status || 'info',
    b.details || ''
  );
  res.json({ success: true, id });
});

// --------------------------------------------------------------------------
// 10. File Upload & Storage
// --------------------------------------------------------------------------
app.get('/api/files', (_req, res) => {
  const rows = db.prepare('SELECT * FROM files ORDER BY created_at DESC').all();
  res.json({ files: rows });
});

app.post('/api/files/upload', upload.array('files', 20), (req, res) => {
  const user = getUserFromReq(req);
  const uploadedFiles = req.files || [];

  const results = [];
  const insertFile = db.prepare(`
    INSERT INTO files (id, filename, original_name, mime_type, size, storage_path, file_url, uploaded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const file of uploadedFiles) {
    const id = `F-${uuidv4().slice(0, 8)}`;
    const fileUrl = `/uploads/${file.filename}`;
    insertFile.run(
      id,
      file.filename,
      file.originalname,
      file.mimetype,
      file.size,
      file.path,
      fileUrl,
      user?.id || 'demo-user'
    );

    results.push({
      id,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      fileUrl,
      uploadedBy: user?.name || 'User',
      createdAt: new Date().toISOString(),
    });
  }

  res.json({ files: results });
});

app.delete('/api/files/:id', requireRole(['admin', 'instructor']), (req, res) => {
  const { id } = req.params;
  const file = db.prepare('SELECT * FROM files WHERE id = ?').get(id);
  if (file) {
    try {
      if (fs.existsSync(file.storage_path)) fs.unlinkSync(file.storage_path);
    } catch (e) {}
    db.prepare('DELETE FROM files WHERE id = ?').run(id);
    db.prepare('UPDATE deliverables SET file_id = null, file_name = null, file_url = null WHERE file_id = ?').run(id);
  }
  res.json({ success: true });
});

// --------------------------------------------------------------------------
// 11. Page Content & Decks
// --------------------------------------------------------------------------
app.get('/api/content/page/:page', (req, res) => {
  const { page } = req.params;
  const rows = db.prepare('SELECT section, items FROM page_content WHERE page = ?').all(page);
  const sections = {};
  for (const row of rows) {
    try {
      sections[row.section] = JSON.parse(row.items);
    } catch (e) {
      sections[row.section] = [];
    }
  }
  res.json({ sections });
});

app.put('/api/content/page/:page/:section', requireRole(['admin', 'instructor']), (req, res) => {
  const { page, section } = req.params;
  const items = req.body.items || [];
  const id = `PC-${page}-${section}`;

  db.prepare(`
    INSERT INTO page_content (id, page, section, items, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(page, section) DO UPDATE SET
      items = excluded.items, updated_at = datetime('now')
  `).run(id, page, section, JSON.stringify(items));

  res.json({ success: true });
});

app.get('/api/content/decks', (_req, res) => {
  const rows = db.prepare('SELECT * FROM presentation_decks ORDER BY sort_order ASC').all();
  const decks = rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    filePath: r.file_path,
    sortOrder: r.sort_order,
  }));
  res.json({ decks });
});

app.post('/api/content/decks', requireRole(['admin', 'instructor']), (req, res) => {
  const b = req.body;
  const id = `DECK-${Date.now().toString(36)}`;
  const maxOrder = db.prepare('SELECT MAX(sort_order) as mo FROM presentation_decks').get().mo ?? -1;

  db.prepare(`
    INSERT INTO presentation_decks (id, title, description, file_path, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, b.title, b.description || '', b.filePath || '', maxOrder + 1);

  res.json({ id, title: b.title, description: b.description, filePath: b.filePath, sortOrder: maxOrder + 1 });
});

app.listen(PORT, () => {
  console.log(`[Pharmacon Backend] Running on http://localhost:${PORT}`);
});
