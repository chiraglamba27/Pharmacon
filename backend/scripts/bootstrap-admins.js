/**
 * bootstrap-admins.js
 *
 * Creates the four admin accounts + Priya Desai (clinic_staff)
 * + one demo doctor + one demo pharmacist + one demo patient.
 *
 * USAGE:
 *   Set environment variables in .env or export them, then run:
 *   node scripts/bootstrap-admins.js
 *
 * Required env vars:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ADMIN_1_EMAIL, ADMIN_1_PASSWORD, ADMIN_1_FIRST_NAME, ADMIN_1_LAST_NAME
 *   ADMIN_2_EMAIL, ADMIN_2_PASSWORD, ADMIN_2_FIRST_NAME, ADMIN_2_LAST_NAME
 *   ADMIN_3_EMAIL, ADMIN_3_PASSWORD, ADMIN_3_FIRST_NAME, ADMIN_3_LAST_NAME
 *   ADMIN_4_EMAIL, ADMIN_4_PASSWORD, ADMIN_4_FIRST_NAME, ADMIN_4_LAST_NAME
 *
 * NEVER commit credentials. Use .env file (gitignored).
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const users = [
  // ─── Four Admins ──────────────────────────────────────────
  {
    email: process.env.ADMIN_1_EMAIL,
    password: process.env.ADMIN_1_PASSWORD,
    first_name: process.env.ADMIN_1_FIRST_NAME || 'Admin',
    last_name: process.env.ADMIN_1_LAST_NAME || 'One',
    role: 'admin',
  },
  {
    email: process.env.ADMIN_2_EMAIL,
    password: process.env.ADMIN_2_PASSWORD,
    first_name: process.env.ADMIN_2_FIRST_NAME || 'Admin',
    last_name: process.env.ADMIN_2_LAST_NAME || 'Two',
    role: 'admin',
  },
  {
    email: process.env.ADMIN_3_EMAIL,
    password: process.env.ADMIN_3_PASSWORD,
    first_name: process.env.ADMIN_3_FIRST_NAME || 'Admin',
    last_name: process.env.ADMIN_3_LAST_NAME || 'Three',
    role: 'admin',
  },
  {
    email: process.env.ADMIN_4_EMAIL,
    password: process.env.ADMIN_4_PASSWORD,
    first_name: process.env.ADMIN_4_FIRST_NAME || 'Admin',
    last_name: process.env.ADMIN_4_LAST_NAME || 'Four',
    role: 'admin',
  },
  // ─── Clinic Staff ─────────────────────────────────────────
  {
    email: process.env.PRIYA_EMAIL || 'priya.desai@pharmacon.local',
    password: process.env.PRIYA_PASSWORD,
    first_name: 'Priya',
    last_name: 'Desai',
    role: 'clinic_staff',
  },
  // ─── Demo Doctor ──────────────────────────────────────────
  {
    email: process.env.DOCTOR_EMAIL || 'dr.patel@pharmacon.local',
    password: process.env.DOCTOR_PASSWORD,
    first_name: 'Rajesh',
    last_name: 'Patel',
    role: 'doctor',
  },
  // ─── Demo Pharmacist ──────────────────────────────────────
  {
    email: process.env.PHARMACIST_EMAIL || 'pharmacist@pharmacon.local',
    password: process.env.PHARMACIST_PASSWORD,
    first_name: 'Meera',
    last_name: 'Krishnan',
    role: 'pharmacist',
  },
  // ─── Demo Patient ─────────────────────────────────────────
  {
    email: process.env.PATIENT_EMAIL || 'patient@pharmacon.local',
    password: process.env.PATIENT_PASSWORD,
    first_name: 'Demo',
    last_name: 'Patient',
    role: 'patient',
  },
];

async function createUser({ email, password, first_name, last_name, role }) {
  if (!email || !password) {
    console.warn(`⚠️  Skipping user ${first_name} ${last_name} — email or password missing`);
    return;
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name, last_name, role },
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log(`⚠️  User already exists: ${email}`);
      return;
    }
    console.error(`❌ Failed to create ${email}:`, authError.message);
    return;
  }

  const userId = authData.user.id;

  // Upsert profile (trigger may have already created it)
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    first_name,
    last_name,
    role,
  }, { onConflict: 'id' });

  if (profileError) {
    console.error(`❌ Failed to upsert profile for ${email}:`, profileError.message);
    return;
  }

  console.log(`✅ Created [${role}]: ${first_name} ${last_name} <${email}>`);
}

async function seedTeamMembers() {
  const team = [
    { name: 'Aryan Sharma',         role: 'Frontend / UI/UX',      responsibilities: 'Design system, React components, responsive UI', technical_focus: 'React, Tailwind CSS, UX', display_order: 1 },
    { name: 'Aniket Raj',           role: 'Backend / Storage',      responsibilities: 'API design, Supabase, storage, auth',           technical_focus: 'Node.js, Express, Supabase', display_order: 2 },
    { name: 'Amitesh Kumar Singh',  role: 'AI / Computer Vision',   responsibilities: 'OCR pipeline, handwriting model, calibration',   technical_focus: 'Python, OpenCV, ML',       display_order: 3 },
    { name: 'Chirag Lamba',         role: 'Integration / QA',       responsibilities: 'Testing, CI/CD, deployment, integration',       technical_focus: 'Jest, GitHub Actions, QA', display_order: 4 },
  ];

  const { error } = await supabase.from('team_members').upsert(team, { onConflict: 'name', ignoreDuplicates: true });
  if (error) console.error('❌ Failed to seed team members:', error.message);
  else console.log('✅ Team members seeded');
}

async function seedMilestones() {
  const milestones = [
    { title: 'Phase 1 — Foundation',    description: 'Project setup, auth, database, CI/CD',                  target_date: '2026-09-20', status: 'completed' },
    { title: 'Phase 2 — Public Site',   description: 'Homepage, team, roadmap, presentations',                target_date: '2026-09-30', status: 'in_progress' },
    { title: 'Phase 3 — Inventory',     description: 'Medicine management, stock, transactions',               target_date: '2026-10-15', status: 'upcoming' },
    { title: 'Phase 4 — Prescriptions', description: 'Upload, processing, review, correction workflow',        target_date: '2026-10-31', status: 'upcoming' },
    { title: 'Phase 5 — Dashboards',    description: 'Role-specific patient, doctor, pharmacist, staff UIs',   target_date: '2026-11-15', status: 'upcoming' },
    { title: 'Phase 6 — AI Interface',  description: 'AI abstraction, calibration infrastructure',             target_date: '2026-11-30', status: 'upcoming' },
    { title: 'Phase 7 — Testing',       description: 'Authorization tests, workflow tests, integration tests', target_date: '2026-12-10', status: 'upcoming' },
    { title: 'Phase 8 — Deployment',    description: 'Production deploy, CI/CD, smoke tests',                  target_date: '2026-12-20', status: 'upcoming' },
  ];

  const { error } = await supabase.from('project_milestones').upsert(milestones, { onConflict: 'title', ignoreDuplicates: true });
  if (error) console.error('❌ Failed to seed milestones:', error.message);
  else console.log('✅ Project milestones seeded');
}

async function main() {
  console.log('\n🚀 Pharmacon Bootstrap Script\n');

  for (const user of users) {
    await createUser(user);
  }

  await seedTeamMembers();
  await seedMilestones();

  console.log('\n✅ Bootstrap complete.\n');
  console.log('⚠️  IMPORTANT: Do not commit credentials. Delete .env after setup if deploying.\n');
}

main().catch(err => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
