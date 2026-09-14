import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { dispensePrescription } from '../src/controllers/prescriptions.controller.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.user = { id: 'pharmacist-1', role: 'pharmacist' };
  next();
});
app.post('/api/prescriptions/:id/dispense', dispensePrescription);
app.use(errorHandler);

import { supabaseAdmin } from '../src/config/supabase.js';

let singleSpy, eqSpy, selectSpy, fromSpy, gtSpy, updateSpy, insertSpy;

beforeEach(() => {
  insertSpy = jest.fn(() => ({ error: null }));
  singleSpy = jest.fn();
  gtSpy = jest.fn(() => ({ data: [{ id: 'batch-1', quantity: 5 }], error: null }));
  eqSpy = jest.fn(() => ({ single: singleSpy, select: selectSpy, gt: gtSpy }));
  selectSpy = jest.fn(() => ({ eq: eqSpy, single: singleSpy }));
  updateSpy = jest.fn(() => ({ eq: eqSpy }));
  
  fromSpy = jest.fn(() => ({
    select: selectSpy,
    update: updateSpy,
    insert: insertSpy
  }));

  supabaseAdmin.from = fromSpy;
});

describe('Inventory dispensing', () => {
  it('should reject dispensing if negative stock would result', async () => {
    singleSpy.mockResolvedValueOnce({ data: { status: 'CONFIRMED' }, error: null });

    const payload = {
      items: [{ medicine_id: '123e4567-e89b-12d3-a456-426614174000', dispense_qty: 10 }]
    };
    
    const res = await request(app).post('/api/prescriptions/p-1/dispense').send(payload);
    
    expect(res.status).toBe(409);
    expect(res.body.error.message).toContain('Insufficient stock');
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('should process dispensing if stock is sufficient', async () => {
    singleSpy.mockResolvedValueOnce({ data: { status: 'CONFIRMED' }, error: null });

    const payload = {
      items: [{ medicine_id: '123e4567-e89b-12d3-a456-426614174000', dispense_qty: 3 }]
    };
    
    const res = await request(app).post('/api/prescriptions/p-1/dispense').send(payload);
    if (res.status === 500) console.error(res.body);
    
    expect(res.status).toBe(200);
    expect(updateSpy).toHaveBeenCalled();
    expect(insertSpy).toHaveBeenCalled();
  });
});
