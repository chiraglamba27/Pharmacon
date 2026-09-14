import { supabaseAdmin } from '../config/supabase.js';

/**
 * Append an audit log entry.
 * Fire-and-forget — never throws, never breaks the main request flow.
 * Audit logs are append-only.
 */
export async function createAuditLog({ actor_user_id, action, entity_type, entity_id, metadata = {} }) {
  const { error } = await supabaseAdmin.from('audit_logs').insert({
    actor_user_id,
    action,
    entity_type,
    entity_id,
    metadata,
  });
  if (error) {
    console.error('[AuditService] Failed to write audit log:', error.message);
  }
}
