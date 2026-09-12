import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const accounts = [
  { username: 'aryan', name: 'Aryan Sharma', role: 'admin' },
  { username: 'aniket', name: 'Aniket Raj', role: 'admin' },
  { username: 'amitesh', name: 'Amitesh Kumar Singh', role: 'admin' },
  { username: 'chirag', name: 'Chirag Lamba', role: 'admin' },
  { username: 'doctor', name: 'Dr. A. Sharma', role: 'doctor' },
  { username: 'pharmacy', name: 'Vikram Singh', role: 'pharmacist' },
  { username: 'staff', name: 'Priya Desai', role: 'clinic-staff' },
  { username: 'patient', name: 'Rahul Kumar', role: 'patient' },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'POST required' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const bootstrapSecret = Deno.env.get('PHARMACON_BOOTSTRAP_SECRET');
  if (!bootstrapSecret || req.headers.get('x-bootstrap-secret') !== bootstrapSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Missing Supabase service configuration' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const password = Deno.env.get('PHARMACON_DEMO_PASSWORD') || 'admin123';

  const results = [];
  for (const account of accounts) {
    const email = `${account.username}@pharmacon.local`;
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username: account.username, name: account.name, role: account.role },
    });

    if (error && !error.message.toLowerCase().includes('already') && !error.message.toLowerCase().includes('exists')) {
      return new Response(JSON.stringify({ error: error.message, username: account.username }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let userId = created.user?.id;
    if (!userId) {
      const { data: users, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (listError) return new Response(JSON.stringify({ error: listError.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      userId = users.users.find((u) => u.email === email)?.id;
    }
    if (!userId) return new Response(JSON.stringify({ error: `Unable to resolve user ${account.username}` }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { error: profileError } = await admin.from('profiles').upsert({ id: userId, username: account.username, name: account.name, role: account.role }, { onConflict: 'id' });
    if (profileError) return new Response(JSON.stringify({ error: profileError.message, username: account.username }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    results.push(account.username);
  }

  return new Response(JSON.stringify({ success: true, accounts: results }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
