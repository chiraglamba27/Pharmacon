import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';

export async function listAuditLogs(req, res, next) {
  try {
    const { page = 1, limit = 50, action, entity_type } = req.query;
    const from = (page - 1) * limit;
    let query = supabaseAdmin.from('audit_logs')
      .select('*, profiles!audit_logs_actor_user_id_fkey(first_name, last_name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (action) query = query.eq('action', action);
    if (entity_type) query = query.eq('entity_type', entity_type);

    const { data, error, count } = await query;
    if (error) throw new AppError(error.message, 500);
    res.json({ data, total: count, page: Number(page), limit: Number(limit) });
  } catch (err) { next(err); }
}

export async function getAuditLog(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin.from('audit_logs').select('*').eq('id', req.params.id).single();
    if (error || !data) throw new AppError('Audit log not found', 404);
    res.json({ data });
  } catch (err) { next(err); }
}
