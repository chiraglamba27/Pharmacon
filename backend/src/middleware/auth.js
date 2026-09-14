import { supabaseAdmin } from '../config/supabase.js';

/**
 * requireAuth middleware
 * Verifies the Supabase JWT from the Authorization header.
 * Fetches the user's role from the trusted DB — never from the token payload.
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Missing or malformed Authorization header' } });
  }

  const token = authHeader.slice(7);

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
    }

    // Fetch role from trusted DB — do NOT trust any role from the frontend/token
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, first_name, last_name, role, created_at')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'User profile not found' } });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: profile.role,   // Always from DB
      profile,
    };

    next();
  } catch (err) {
    console.error('[requireAuth] Error:', err.message);
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication failed' } });
  }
}

/**
 * requireRole(...roles) middleware factory
 * Usage: requireRole('admin', 'doctor')
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: `Access denied. Required: ${roles.join(' or ')}` },
      });
    }
    next();
  };
}
