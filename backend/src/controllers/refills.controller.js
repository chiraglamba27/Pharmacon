import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';
import { createAuditLog } from '../services/AuditService.js';
import { z } from 'zod';

const refillSchema = z.object({
  prescription_id: z.string().uuid(),
  notes: z.string().optional(),
});

export async function createRefillRequest(req, res, next) {
  try {
    const parsed = refillSchema.parse(req.body);

    // Verify prescription belongs to this patient
    const { data: pres, error: presError } = await supabaseAdmin
      .from('prescriptions').select('patient_id, status').eq('id', parsed.prescription_id).single();
    if (presError || !pres) throw new AppError('Prescription not found', 404);
    if (pres.patient_id !== req.user.id) throw new AppError('Access denied', 403);
    if (pres.status !== 'CONFIRMED' && pres.status !== 'DISPENSED') {
      throw new AppError('Prescription is not eligible for refill', 400);
    }

    const { data, error } = await supabaseAdmin
      .from('refill_requests')
      .insert({ patient_id: req.user.id, prescription_id: parsed.prescription_id, status: 'PENDING', notes: parsed.notes || null })
      .select().single();
    if (error) throw new AppError(error.message, 500);

    createAuditLog({ actor_user_id: req.user.id, action: 'REFILL_CREATED', entity_type: 'refill_request', entity_id: data.id });
    res.status(201).json({ data });
  } catch (err) { next(err); }
}

export async function getMyRefills(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('refill_requests').select('*, prescriptions(*)').eq('patient_id', req.user.id).order('created_at', { ascending: false });
    if (error) throw new AppError(error.message, 500);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function listRefillRequests(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('refill_requests')
      .select('*, prescriptions(*), profiles!refill_requests_patient_id_fkey(first_name, last_name)')
      .order('created_at', { ascending: false });
    if (error) throw new AppError(error.message, 500);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function approveRefill(req, res, next) {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('refill_requests').update({ status: 'APPROVED', reviewed_by: req.user.id, reviewed_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw new AppError(error.message, 500);
    createAuditLog({ actor_user_id: req.user.id, action: 'REFILL_APPROVED', entity_type: 'refill_request', entity_id: id });
    res.json({ data });
  } catch (err) { next(err); }
}

export async function rejectRefill(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const { data, error } = await supabaseAdmin
      .from('refill_requests').update({ status: 'REJECTED', reviewed_by: req.user.id, reviewed_at: new Date().toISOString(), notes: reason || null }).eq('id', id).select().single();
    if (error) throw new AppError(error.message, 500);
    createAuditLog({ actor_user_id: req.user.id, action: 'REFILL_REJECTED', entity_type: 'refill_request', entity_id: id });
    res.json({ data });
  } catch (err) { next(err); }
}
