import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';
import { createAuditLog } from '../services/AuditService.js';
import { z } from 'zod';

const deliverableSchema = z.object({
  title: z.string().min(1),
  version: z.string().min(1),
  type: z.enum(['planning', 'demo', 'final', 'report', 'other']),
  date: z.string(),
  authors: z.array(z.string()).min(1),
  description: z.string().optional(),
  file_asset_id: z.string().uuid().optional(),
});

export async function listDeliverables(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('deliverables')
      .select('*, file_assets(id, original_name, mime_type, size, storage_path, bucket)')
      .eq('status', 'published')
      .order('date', { ascending: false });
    if (error) throw new AppError(error.message, 500);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function listAllDeliverables(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('deliverables')
      .select('*, file_assets(id, original_name, mime_type, size, storage_path, bucket)')
      .order('date', { ascending: false });
    if (error) throw new AppError(error.message, 500);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function getDeliverable(req, res, next) {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('deliverables')
      .select('*, file_assets(*)')
      .eq('id', id)
      .single();
    if (error || !data) throw new AppError('Deliverable not found', 404);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function createDeliverable(req, res, next) {
  try {
    const parsed = deliverableSchema.parse(req.body);
    const { data, error } = await supabaseAdmin
      .from('deliverables')
      .insert({ ...parsed, status: 'draft' })
      .select()
      .single();
    if (error) throw new AppError(error.message, 500);
    res.status(201).json({ data });
  } catch (err) { next(err); }
}

export async function updateDeliverable(req, res, next) {
  try {
    const { id } = req.params;
    const parsed = deliverableSchema.partial().parse(req.body);
    const { data, error } = await supabaseAdmin
      .from('deliverables')
      .update(parsed)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new AppError(error.message, 500);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function publishDeliverable(req, res, next) {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('deliverables')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new AppError(error.message, 500);
    createAuditLog({
      actor_user_id: req.user.id,
      action: 'DELIVERABLE_PUBLISHED',
      entity_type: 'deliverable',
      entity_id: id,
    });
    res.json({ data });
  } catch (err) { next(err); }
}

export async function deleteDeliverable(req, res, next) {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('deliverables').delete().eq('id', id);
    if (error) throw new AppError(error.message, 500);
    res.json({ message: 'Deliverable deleted' });
  } catch (err) { next(err); }
}
