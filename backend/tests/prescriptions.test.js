import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { updateStatus, confirmPrescription } from '../src/controllers/prescriptions.controller.js';

const app = express();
app.use(express.json());

// Mock requireAuth to pass auth automatically
app.use((req, res, next) => {
  req.user = { id: 'doctor-1', role: 'doctor' };
  next();
});

app.patch('/api/prescriptions/:id/status', updateStatus);
app.post('/api/prescriptions/:id/confirm', confirmPrescription);

import { supabaseAdmin } from '../src/config/supabase.js';

let updateSpy;
let singleSpy;
let eqSpy;
let selectSpy;
let fromSpy;
let insertSpy;

beforeEach(() => {
  insertSpy = jest.fn();
  singleSpy = jest.fn();
  eqSpy = jest.fn(() => ({ single: singleSpy, select: selectSpy }));
  selectSpy = jest.fn(() => ({ eq: eqSpy, single: singleSpy }));
  updateSpy = jest.fn(() => ({ eq: eqSpy }));
  
  fromSpy = jest.fn(() => ({
    select: selectSpy,
    update: updateSpy,
    insert: insertSpy
  }));

  supabaseAdmin.from = fromSpy;
});

describe('Prescription Workflow', () => {
  it('should allow a doctor to update status if assigned', async () => {
    // Mock the doctor check
    singleSpy.mockResolvedValueOnce({ data: { doctor_id: 'doctor-1' }, error: null });
    // Mock the actual update
    singleSpy.mockResolvedValueOnce({ data: { id: 'p-1', status: 'CORRECTED' }, error: null });
    
    const res = await request(app).patch('/api/prescriptions/p-1/status').send({ status: 'CORRECTED' });
    
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CORRECTED');
    expect(updateSpy).toHaveBeenCalledWith({ status: 'CORRECTED', updated_at: expect.any(String) });
  });

  it('should deny status update if doctor is not assigned', async () => {
    // Mock the doctor check
    singleSpy.mockResolvedValueOnce({ data: { doctor_id: 'doctor-2' }, error: null });
    
    const res = await request(app).patch('/api/prescriptions/p-1/status').send({ status: 'CORRECTED' });
    
    expect(res.status).toBe(403);
    expect(updateSpy).not.toHaveBeenCalled();
  });
});
