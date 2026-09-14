import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { requireAuth, requireRole } from '../src/middleware/auth.js';

// Create a test app
const app = express();
app.use(express.json());

// Apply middleware
app.get('/api/protected', requireAuth, (req, res) => res.json({ message: 'Success', user: req.user }));
app.get('/api/admin-only', requireAuth, requireRole('admin'), (req, res) => res.json({ message: 'Admin Success' }));

// We need to mock supabaseAdmin but since it's already imported in auth.js, we can mock the functions
// Wait, in ESM, mocking requires unstable_mockModule before import, or we can just mock the module directly if we use CommonJS, but this is ESM.
// To keep it robust without unstable_mockModule complexity, let's mock the actual supabaseAdmin object methods imported inside auth.js.
import { supabaseAdmin } from '../src/config/supabase.js';

// Spy on supabase methods
let getUserSpy;
let fromSpy;
let selectSpy;
let eqSpy;
let singleSpy;

beforeEach(() => {
  singleSpy = jest.fn();
  eqSpy = jest.fn(() => ({ single: singleSpy }));
  selectSpy = jest.fn(() => ({ eq: eqSpy }));
  fromSpy = jest.fn(() => ({ select: selectSpy }));
  getUserSpy = jest.fn();

  supabaseAdmin.auth = { getUser: getUserSpy };
  supabaseAdmin.from = fromSpy;
});

describe('Auth Middleware', () => {
  it('should return 401 if missing Authorization header', async () => {
    const res = await request(app).get('/api/protected');
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Missing or malformed Authorization header');
  });

  it('should return 401 if token is invalid', async () => {
    getUserSpy.mockResolvedValue({ data: { user: null }, error: new Error('Invalid token') });
    
    const res = await request(app).get('/api/protected').set('Authorization', 'Bearer invalid-token');
    
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Invalid or expired token');
    expect(getUserSpy).toHaveBeenCalledWith('invalid-token');
  });

  it('should return 403 if profile not found', async () => {
    getUserSpy.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    singleSpy.mockResolvedValue({ data: null, error: new Error('Profile missing') });
    
    const res = await request(app).get('/api/protected').set('Authorization', 'Bearer valid-token');
    
    expect(res.status).toBe(403);
    expect(res.body.error.message).toBe('User profile not found');
  });

  it('should return 200 and attach user if valid', async () => {
    getUserSpy.mockResolvedValue({ data: { user: { id: 'user-1', email: 'test@test.com' } }, error: null });
    singleSpy.mockResolvedValue({ data: { id: 'user-1', role: 'patient' }, error: null });
    
    const res = await request(app).get('/api/protected').set('Authorization', 'Bearer valid-token');
    
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('patient');
  });
});

describe('Role Middleware', () => {
  it('should return 403 if user lacks required role', async () => {
    getUserSpy.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    singleSpy.mockResolvedValue({ data: { id: 'user-1', role: 'patient' }, error: null });
    
    const res = await request(app).get('/api/admin-only').set('Authorization', 'Bearer valid-token');
    
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('should return 200 if user has required role', async () => {
    getUserSpy.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null });
    singleSpy.mockResolvedValue({ data: { id: 'admin-1', role: 'admin' }, error: null });
    
    const res = await request(app).get('/api/admin-only').set('Authorization', 'Bearer valid-token');
    
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Admin Success');
  });
});
