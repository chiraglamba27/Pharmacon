-- ============================================================
-- Migration 002: Row Level Security Policies
-- All sensitive tables are protected at the database level.
-- The Node.js backend enforces authorization on top of this.
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles                     enable row level security;
alter table public.team_members                 enable row level security;
alter table public.project_pages                enable row level security;
alter table public.project_milestones           enable row level security;
alter table public.file_assets                  enable row level security;
alter table public.deliverables                 enable row level security;
alter table public.medicines                    enable row level security;
alter table public.inventory_batches            enable row level security;
alter table public.inventory_transactions       enable row level security;
alter table public.prescriptions                enable row level security;
alter table public.prescription_extraction_fields enable row level security;
alter table public.prescription_corrections     enable row level security;
alter table public.prescription_status_history  enable row level security;
alter table public.refill_requests              enable row level security;
alter table public.doctor_calibration_profiles  enable row level security;
alter table public.doctor_calibration_samples   enable row level security;
alter table public.audit_logs                   enable row level security;

-- ─── Helper: get calling user's role ──────────────────────────────────────
create or replace function public.current_user_role()
returns text language sql security definer stable as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ─── Profiles ─────────────────────────────────────────────────────────────
-- Users can see only their own profile (backend service role bypasses for admin ops)
create policy "profiles: users see own" on public.profiles
  for select using (id = auth.uid());

create policy "profiles: users update own" on public.profiles
  for update using (id = auth.uid());

-- ─── Team Members ─────────────────────────────────────────────────────────
-- Public read (used by public website)
create policy "team_members: public read" on public.team_members
  for select using (true);

create policy "team_members: admin write" on public.team_members
  for all using (public.current_user_role() = 'admin');

-- ─── Project Pages ────────────────────────────────────────────────────────
create policy "project_pages: public read" on public.project_pages
  for select using (true);

create policy "project_pages: admin write" on public.project_pages
  for all using (public.current_user_role() = 'admin');

-- ─── Project Milestones ───────────────────────────────────────────────────
create policy "milestones: public read" on public.project_milestones
  for select using (true);

create policy "milestones: admin write" on public.project_milestones
  for all using (public.current_user_role() = 'admin');

-- ─── File Assets ──────────────────────────────────────────────────────────
-- Public files are readable by all; private files only by uploader or staff
create policy "file_assets: public files readable" on public.file_assets
  for select using (visibility = 'public');

create policy "file_assets: private files staff readable" on public.file_assets
  for select using (
    visibility = 'private' and (
      uploaded_by = auth.uid() or
      public.current_user_role() in ('admin', 'doctor', 'clinic_staff', 'pharmacist')
    )
  );

create policy "file_assets: authenticated insert" on public.file_assets
  for insert with check (auth.uid() is not null);

create policy "file_assets: admin delete" on public.file_assets
  for delete using (public.current_user_role() = 'admin');

-- ─── Deliverables ─────────────────────────────────────────────────────────
create policy "deliverables: public read published" on public.deliverables
  for select using (status = 'published');

create policy "deliverables: admin read all" on public.deliverables
  for select using (public.current_user_role() = 'admin');

create policy "deliverables: admin write" on public.deliverables
  for all using (public.current_user_role() = 'admin');

-- ─── Medicines ────────────────────────────────────────────────────────────
-- Authenticated users can read medicines (needed for prescription items)
create policy "medicines: authenticated read" on public.medicines
  for select using (auth.uid() is not null);

create policy "medicines: pharmacist/admin write" on public.medicines
  for all using (public.current_user_role() in ('admin', 'pharmacist'));

-- ─── Inventory Batches ────────────────────────────────────────────────────
create policy "inventory_batches: pharmacist/admin read" on public.inventory_batches
  for select using (public.current_user_role() in ('admin', 'pharmacist'));

create policy "inventory_batches: pharmacist/admin write" on public.inventory_batches
  for all using (public.current_user_role() in ('admin', 'pharmacist'));

-- ─── Inventory Transactions ───────────────────────────────────────────────
create policy "inventory_transactions: pharmacist/admin read" on public.inventory_transactions
  for select using (public.current_user_role() in ('admin', 'pharmacist'));

create policy "inventory_transactions: pharmacist/admin insert" on public.inventory_transactions
  for insert with check (public.current_user_role() in ('admin', 'pharmacist'));

-- ─── Prescriptions ────────────────────────────────────────────────────────
-- Patients see only their own prescriptions
create policy "prescriptions: patient own" on public.prescriptions
  for select using (patient_id = auth.uid() and public.current_user_role() = 'patient');

-- Doctors see prescriptions assigned to them
create policy "prescriptions: doctor assigned" on public.prescriptions
  for select using (doctor_id = auth.uid() and public.current_user_role() = 'doctor');

-- Clinic staff, pharmacists, admins see all
create policy "prescriptions: staff read" on public.prescriptions
  for select using (public.current_user_role() in ('admin', 'clinic_staff', 'pharmacist'));

-- Upload: clinic staff, doctor, admin
create policy "prescriptions: upload" on public.prescriptions
  for insert with check (public.current_user_role() in ('admin', 'clinic_staff', 'doctor'));

-- Update: clinic staff, doctor, admin
create policy "prescriptions: update" on public.prescriptions
  for update using (public.current_user_role() in ('admin', 'clinic_staff', 'doctor'));

-- ─── Prescription Extraction Fields ───────────────────────────────────────
create policy "extraction_fields: staff read" on public.prescription_extraction_fields
  for select using (public.current_user_role() in ('admin', 'clinic_staff', 'doctor', 'pharmacist'));

create policy "extraction_fields: patient own" on public.prescription_extraction_fields
  for select using (
    public.current_user_role() = 'patient' and
    exists (select 1 from public.prescriptions p where p.id = prescription_id and p.patient_id = auth.uid())
  );

create policy "extraction_fields: staff write" on public.prescription_extraction_fields
  for all using (public.current_user_role() in ('admin', 'clinic_staff', 'doctor'));

-- ─── Prescription Corrections ─────────────────────────────────────────────
create policy "corrections: staff read" on public.prescription_corrections
  for select using (public.current_user_role() in ('admin', 'clinic_staff', 'doctor'));

create policy "corrections: staff insert" on public.prescription_corrections
  for insert with check (public.current_user_role() in ('admin', 'clinic_staff', 'doctor'));

-- ─── Prescription Status History ──────────────────────────────────────────
create policy "status_history: staff read" on public.prescription_status_history
  for select using (public.current_user_role() in ('admin', 'clinic_staff', 'doctor', 'pharmacist'));

create policy "status_history: patient own" on public.prescription_status_history
  for select using (
    public.current_user_role() = 'patient' and
    exists (select 1 from public.prescriptions p where p.id = prescription_id and p.patient_id = auth.uid())
  );

create policy "status_history: staff insert" on public.prescription_status_history
  for insert with check (public.current_user_role() in ('admin', 'clinic_staff', 'doctor', 'pharmacist'));

-- ─── Refill Requests ──────────────────────────────────────────────────────
create policy "refills: patient own" on public.refill_requests
  for select using (patient_id = auth.uid() and public.current_user_role() = 'patient');

create policy "refills: patient insert" on public.refill_requests
  for insert with check (patient_id = auth.uid() and public.current_user_role() = 'patient');

create policy "refills: pharmacist/admin read" on public.refill_requests
  for select using (public.current_user_role() in ('admin', 'pharmacist'));

create policy "refills: pharmacist/admin update" on public.refill_requests
  for update using (public.current_user_role() in ('admin', 'pharmacist'));

-- ─── Doctor Calibration Profiles ──────────────────────────────────────────
create policy "calibration_profiles: doctor own" on public.doctor_calibration_profiles
  for select using (doctor_id = auth.uid() and public.current_user_role() = 'doctor');

create policy "calibration_profiles: admin read" on public.doctor_calibration_profiles
  for select using (public.current_user_role() = 'admin');

create policy "calibration_profiles: doctor upsert" on public.doctor_calibration_profiles
  for all using (doctor_id = auth.uid() and public.current_user_role() = 'doctor');

-- ─── Doctor Calibration Samples ───────────────────────────────────────────
create policy "calibration_samples: doctor own" on public.doctor_calibration_samples
  for select using (doctor_id = auth.uid() and public.current_user_role() = 'doctor');

create policy "calibration_samples: doctor insert" on public.doctor_calibration_samples
  for insert with check (doctor_id = auth.uid() and public.current_user_role() = 'doctor');

create policy "calibration_samples: admin manage" on public.doctor_calibration_samples
  for all using (public.current_user_role() = 'admin');

-- ─── Audit Logs ───────────────────────────────────────────────────────────
-- Append-only — no update or delete permitted
create policy "audit_logs: admin read" on public.audit_logs
  for select using (public.current_user_role() = 'admin');

create policy "audit_logs: backend insert" on public.audit_logs
  for insert with check (auth.uid() is not null);
