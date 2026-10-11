import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'pharmacon.db');

export const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  // Check if users table needs migration to email primary key
  try {
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    const hasEmail = tableInfo.some(col => col.name === 'email');
    if (tableInfo.length > 0 && !hasEmail) {
      db.exec('DROP TABLE users');
    }
  } catch (e) {}

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY NOT NULL,
      id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('doctor','clinic-staff','pharmacist','patient','admin','instructor')),
      avatar TEXT DEFAULT '',
      google_id TEXT DEFAULT '',
      password TEXT DEFAULT 'admin123',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS versions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      authors TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('current','archived','future','draft')),
      change_summary TEXT NOT NULL DEFAULT '',
      commit_ref TEXT DEFAULT '',
      deployment_url TEXT DEFAULT '',
      parent_version_id TEXT,
      file_url TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS deliverables (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      version_id TEXT,
      version_name TEXT DEFAULT '',
      date TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('draft','in-progress','published','archived')),
      description TEXT NOT NULL DEFAULT '',
      file_id TEXT,
      file_name TEXT,
      file_url TEXT,
      authors TEXT DEFAULT 'Team Pharmacon',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      focus TEXT NOT NULL,
      avatar TEXT NOT NULL,
      skills TEXT NOT NULL DEFAULT '',
      avatar_file_id TEXT,
      github_url TEXT DEFAULT '',
      linkedin_url TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS inventory_items (
      id TEXT PRIMARY KEY,
      medicine TEXT NOT NULL,
      strength TEXT NOT NULL,
      dosage_form TEXT NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      pack_size TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      reorder_level INTEGER NOT NULL DEFAULT 10,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      doctor_name TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('draft','confirmed','dispensed')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS prescription_fields (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prescription_id TEXT NOT NULL,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      confidence INTEGER NOT NULL,
      needs_verification INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS refill_requests (
      id TEXT PRIMARY KEY,
      prescription_id TEXT,
      patient_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      medicine TEXT NOT NULL,
      strength TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending','approved','rejected','contacted')),
      requested_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      actor TEXT NOT NULL,
      role TEXT NOT NULL,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('success','warning','info')),
      details TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS page_content (
      id TEXT PRIMARY KEY,
      page TEXT NOT NULL,
      section TEXT NOT NULL,
      items TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(page, section)
    );

    CREATE TABLE IF NOT EXISTS presentation_decks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      file_path TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      storage_path TEXT NOT NULL UNIQUE,
      file_url TEXT NOT NULL,
      uploaded_by TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS corrections (
      id TEXT PRIMARY KEY,
      prescription_id TEXT NOT NULL,
      field TEXT NOT NULL,
      original_prediction TEXT NOT NULL,
      corrected_value TEXT NOT NULL,
      confidence_before INTEGER NOT NULL DEFAULT 80,
      doctor_name TEXT NOT NULL,
      staff_member TEXT NOT NULL,
      timestamp TEXT DEFAULT (datetime('now'))
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  // Seed Users
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (email, id, name, role, avatar, google_id, password)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const users = [
      ['chiraglamba@gmail.com', 'u-admin-4', 'Chirag Lamba', 'admin', 'https://api.dicebear.com/7.x/initials/svg?seed=CL', '', 'admin123'],
      ['aryan.sharma@pharmacon.org', 'u-admin-1', 'Aryan Sharma', 'admin', 'https://api.dicebear.com/7.x/initials/svg?seed=AS', '', 'admin123'],
      ['aniket.raj@pharmacon.org', 'u-admin-2', 'Aniket Raj', 'admin', 'https://api.dicebear.com/7.x/initials/svg?seed=AR', '', 'admin123'],
      ['amitesh.singh@pharmacon.org', 'u-admin-3', 'Amitesh Kumar Singh', 'admin', 'https://api.dicebear.com/7.x/initials/svg?seed=AK', '', 'admin123'],
      ['dr.sharma@pharmacon.org', 'u-doc-1', 'Dr. A. Sharma', 'doctor', 'https://api.dicebear.com/7.x/initials/svg?seed=DS', '', 'admin123'],
      ['pharmacy.vikram@pharmacon.org', 'u-pharm-1', 'Vikram Singh', 'pharmacist', 'https://api.dicebear.com/7.x/initials/svg?seed=VS', '', 'admin123'],
      ['clinic.priya@pharmacon.org', 'u-staff-1', 'Priya Desai', 'clinic-staff', 'https://api.dicebear.com/7.x/initials/svg?seed=PD', '', 'admin123'],
      ['patient.rahul@gmail.com', 'u-pat-1', 'Rahul Kumar', 'patient', 'https://api.dicebear.com/7.x/initials/svg?seed=RK', '', 'admin123'],
      ['instructor@pharmacon.org', 'u-inst-1', 'UCS503 Evaluator', 'instructor', 'https://api.dicebear.com/7.x/initials/svg?seed=IE', '', 'admin123'],
    ];

    for (const u of users) {
      insertUser.run(...u);
    }
  }

  // Seed Team Members
  const teamCount = db.prepare('SELECT COUNT(*) as count FROM team_members').get().count;
  if (teamCount === 0) {
    const insertTeam = db.prepare(`
      INSERT INTO team_members (id, name, role, focus, avatar, skills, github_url, linkedin_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const team = [
      ['T-001', 'Aryan Sharma', 'Frontend Lead', 'UI/UX architecture, responsive design system, tactile component library, and interactive presentations.', 'AS', 'React, Vite, TypeScript, Tailwind CSS, Recharts', 'https://github.com', 'https://linkedin.com'],
      ['T-002', 'Aniket Raj', 'Backend Lead', 'Node.js architecture, persistent database design, storage integrations, and release publishing engine.', 'AR', 'Node.js, Express, SQLite, REST APIs', 'https://github.com', 'https://linkedin.com'],
      ['T-003', 'Amitesh Kumar Singh', 'AI / CV Engineer', 'Handwriting segmentation pipeline, CNN-Transformer feature models, and doctor-adaptive calibration loops.', 'AK', 'Python, PyTorch, Computer Vision, OCR, CNN-Transformers', 'https://github.com', 'https://linkedin.com'],
      ['T-004', 'Chirag Lamba', 'Integration Lead', 'Formulary SKU matching algorithms, security audit controls, end-to-end reliability verification, and CI/CD pipelines.', 'CL', 'CI/CD, System Integration, Node.js, Testing, Security Audit', 'https://github.com', 'https://linkedin.com'],
    ];

    for (const t of team) {
      insertTeam.run(...t);
    }
  }

  // Seed Versions
  const versionCount = db.prepare('SELECT COUNT(*) as count FROM versions').get().count;
  if (versionCount === 0) {
    const insertVersion = db.prepare(`
      INSERT INTO versions (id, name, date, authors, status, change_summary, commit_ref, deployment_url, file_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertVersion.run(
      'v1.0.0',
      'Planning Presentation v1',
      '2026-08-25',
      'Aryan Sharma, Aniket Raj, Amitesh Kumar Singh, Chirag Lamba',
      'current',
      'Initial project planning deliverable covering scope, intended users, system architecture, performance goals, technical risks, and interactive Gantt roadmap.',
      'main@a89c42e',
      '#/presentation/v1',
      '/presentations/Pharmacon_Commitment_Pitch.pptx'
    );

    insertVersion.run(
      'v2.0.0',
      'Planning Presentation v2',
      '2026-09-10',
      'Team Pharmacon',
      'future',
      'Refined scope addressing writer recruitment milestones, real clinic calibration workflows, and persistent Node.js backend integration.',
      'dev@f190b21',
      '#/presentation/v2',
      ''
    );
  }

  // Seed Deliverables
  const delivCount = db.prepare('SELECT COUNT(*) as count FROM deliverables').get().count;
  if (delivCount === 0) {
    const insertDeliv = db.prepare(`
      INSERT INTO deliverables (id, title, type, version_id, version_name, date, status, description, file_name, file_url, authors)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertDeliv.run(
      'deliv-v1-deck',
      'Planning Presentation v1 (Interactive Web Deck)',
      'Interactive Presentation',
      'v1.0.0',
      'Planning Presentation v1',
      '2026-08-25',
      'published',
      'Direct browser-delivered planning presentation satisfying all UCS503 requirements.',
      'Pharmacon_Commitment_Pitch.pptx',
      '/presentations/Pharmacon_Commitment_Pitch.pptx',
      'Team Pharmacon (Aryan, Aniket, Amitesh, Chirag)'
    );

    insertDeliv.run(
      'deliv-v2-deck',
      'Planning Presentation v2 (Scope & Feedback Updates)',
      'Interactive Presentation',
      'v2.0.0',
      'Planning Presentation v2',
      '2026-09-10',
      'published',
      'Updated planning deliverable incorporating instructor feedback and revised architecture.',
      'Planning_V2_Updated.pptx',
      '',
      'Team Pharmacon'
    );
  }

  // Seed Inventory Items
  const invCount = db.prepare('SELECT COUNT(*) as count FROM inventory_items').get().count;
  if (invCount === 0) {
    const insertInv = db.prepare(`
      INSERT INTO inventory_items (id, medicine, strength, dosage_form, sku, pack_size, stock, reorder_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertInv.run('INV-001', 'Amoxicillin', '500 mg', 'Capsule', 'AMX-500-CAP', '100 caps', 142, 25);
    insertInv.run('INV-002', 'Metformin', '500 mg', 'Tablet', 'MET-500-TAB', '60 tabs', 18, 20);
    insertInv.run('INV-003', 'Paracetamol', '650 mg', 'Tablet', 'PAR-650-TAB', '100 tabs', 240, 30);
    insertInv.run('INV-004', 'Azithromycin', '500 mg', 'Tablet', 'AZI-500-TAB', '30 tabs', 8, 15);
  }

  // Seed Prescriptions & Fields
  const rxCount = db.prepare('SELECT COUNT(*) as count FROM prescriptions').get().count;
  if (rxCount === 0) {
    const insertRx = db.prepare(`
      INSERT INTO prescriptions (id, patient_id, patient_name, doctor_name, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertRx.run('RX-2024-0001', 'PT-1001', 'Rahul Kumar', 'Dr. A. Sharma', 'confirmed');

    const insertField = db.prepare(`
      INSERT INTO prescription_fields (prescription_id, label, value, confidence, needs_verification)
      VALUES (?, ?, ?, ?, ?)
    `);

    const fields = [
      ['RX-2024-0001', 'Medicine', 'Amoxicillin', 94, 0],
      ['RX-2024-0001', 'Strength', '500 mg', 97, 0],
      ['RX-2024-0001', 'Dosage Form', 'Tablet', 96, 0],
      ['RX-2024-0001', 'Frequency', '1-0-1', 86, 1],
      ['RX-2024-0001', 'Route', 'Oral', 92, 0],
      ['RX-2024-0001', 'Duration', '5 days', 91, 0],
      ['RX-2024-0001', 'Instructions', 'After food', 88, 1],
    ];

    for (const f of fields) {
      insertField.run(...f);
    }
  }

  // Seed Refill Requests
  const rfCount = db.prepare('SELECT COUNT(*) as count FROM refill_requests').get().count;
  if (rfCount === 0) {
    const insertRf = db.prepare(`
      INSERT INTO refill_requests (id, prescription_id, patient_id, patient_name, medicine, strength, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertRf.run('RF-001', 'RX-2024-0001', 'PT-1001', 'Rahul Kumar', 'Amoxicillin', '500 mg', 'pending');
    insertRf.run('RF-002', 'RX-2024-0001', 'PT-1002', 'Meera Patel', 'Metformin', '500 mg', 'pending');
  }

  // Seed Audit Events
  const auditCount = db.prepare('SELECT COUNT(*) as count FROM audit_events').get().count;
  if (auditCount === 0) {
    const insertAudit = db.prepare(`
      INSERT INTO audit_events (id, actor, role, action, entity, entity_id, status, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertAudit.run('AE-001', 'System', 'System', 'Seeded persistent demo workflow', 'Prescription', 'RX-2024-0001', 'info', 'Initial SQLite system initialization');
    insertAudit.run('AE-002', 'Dr. A. Sharma', 'doctor', 'Digitized paper prescription', 'Prescription', 'RX-2024-0001', 'success', '98.2% OCR confidence');
  }

  // Seed Decks
  const deckCount = db.prepare('SELECT COUNT(*) as count FROM presentation_decks').get().count;
  if (deckCount === 0) {
    const insertDeck = db.prepare(`
      INSERT INTO presentation_decks (id, title, description, file_path, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertDeck.run('DECK-001', 'Pharmacon Commitment Pitch', 'Revised scope, doctor-adaptive recognition strategy, roadmap and approval requirements.', '/presentations/Pharmacon_Commitment_Pitch.pptx', 0);
    insertDeck.run('DECK-002', 'Merged Project Ideas Presentation', "Original team project-ideas deck, including the medication-scheduling concept that preceded Pharmacon's revised scope.", '/presentations/Merged_Presentation_from_Claude.pptx', 1);
  }

  // Seed Clinic Intake Prescriptions if missing
  const p91 = db.prepare('SELECT id FROM prescriptions WHERE id = ?').get('RX-2026-0091');
  if (!p91) {
    db.prepare(`
      INSERT INTO prescriptions (id, patient_id, patient_name, doctor_name, status)
      VALUES (?, ?, ?, ?, ?)
    `).run('RX-2026-0091', 'PT-1003', 'Sunil Reddy', 'Dr. A. Sharma', 'draft');

    const insertField = db.prepare(`
      INSERT INTO prescription_fields (prescription_id, label, value, confidence, needs_verification)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertField.run('RX-2026-0091', 'Medicine', 'Amoxicillin', 98, 0);
    insertField.run('RX-2026-0091', 'Strength', '500 mg', 96, 0);
    insertField.run('RX-2026-0091', 'Dosage Form', 'Capsule', 95, 0);
    insertField.run('RX-2026-0091', 'Frequency', '1-0-1 (ambiguous)', 84, 1);
    insertField.run('RX-2026-0091', 'Duration', '5 days', 94, 0);
    insertField.run('RX-2026-0091', 'Instructions', 'After meals with water', 92, 0);
  }

  const p92 = db.prepare('SELECT id FROM prescriptions WHERE id = ?').get('RX-2026-0092');
  if (!p92) {
    db.prepare(`
      INSERT INTO prescriptions (id, patient_id, patient_name, doctor_name, status)
      VALUES (?, ?, ?, ?, ?)
    `).run('RX-2026-0092', 'PT-1004', 'Kavita Nair', 'Dr. S. Verma', 'draft');

    const insertField = db.prepare(`
      INSERT INTO prescription_fields (prescription_id, label, value, confidence, needs_verification)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertField.run('RX-2026-0092', 'Medicine', 'Metformin', 97, 0);
    insertField.run('RX-2026-0092', 'Strength', '500 mg', 99, 0);
    insertField.run('RX-2026-0092', 'Dosage Form', 'Tab vs Cap', 81, 1);
    insertField.run('RX-2026-0092', 'Frequency', '1-0-0', 95, 0);
    insertField.run('RX-2026-0092', 'Instructions', 'Before meals', 86, 1);
  }

  // Seed Corrections
  const corCount = db.prepare('SELECT COUNT(*) as count FROM corrections').get().count;
  if (corCount === 0) {
    const insertCor = db.prepare(`
      INSERT INTO corrections (id, prescription_id, field, original_prediction, corrected_value, confidence_before, doctor_name, staff_member)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertCor.run('CR-001', 'RX-2024-0042', 'Medicine Name', 'Amoxcillin', 'Amoxicillin', 78, 'Dr. A. Sharma', 'Priya Desai');
    insertCor.run('CR-002', 'RX-2024-0042', 'Frequency', '1-0-2', '1-0-1', 82, 'Dr. A. Sharma', 'Priya Desai');
    insertCor.run('CR-003', 'RX-2024-0038', 'Medicine Name', 'Paracetmol', 'Paracetamol', 74, 'Dr. R. Gupta', 'Anil Mehta');
    insertCor.run('CR-004', 'RX-2024-0038', 'Strength', '250mg', '500 mg', 79, 'Dr. R. Gupta', 'Anil Mehta');
  }
}
