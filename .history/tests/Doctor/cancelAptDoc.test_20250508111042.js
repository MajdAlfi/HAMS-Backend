const request = require('supertest');
const express = require('express');
const router = require('../../src/Doctor/post/cancelAPtDoc'); 
const aptModel = require('../../src/Model/appointments');

jest.mock('../../src/Model/appointments');

// Setup test app
const app = express();
app.use(express.json());
app.use('/', router);

describe('PATCH /:aptId - Doctor cancels appointment', () => {
  const endpoint = '/12345';
  const headers = { uid: 'doc123' };

  beforeEach(() => jest.clearAllMocks());

  it('should cancel appointment successfully', async () => {
    aptModel.findById.mockResolvedValue({
      _id: '12345',
      uidDoc: 'doc123',
      State: 'Confirmed',
      save: jest.fn().mockResolvedValue({}),
    });

    const res = await request(app).patch(endpoint).set(headers);
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Appointment cancelled successfully.');
  });

  it('should return 400 if uid is missing', async () => {
    const res = await request(app).patch(endpoint);
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('Doctor UID missing in headers.');
  });

  it('should return 404 if appointment not found', async () => {
    aptModel.findById.mockResolvedValue(null);
    const res = await request(app).patch(endpoint).set(headers);
    expect(res.statusCode).toBe(404);
    expect(res.text).toContain('Appointment not found.');
  });

  it('should return 403 if uid does not match appointment doctor', async () => {
    aptModel.findById.mockResolvedValue({
      uidDoc: 'differentDoc',
    });

    const res = await request(app).patch(endpoint).set(headers);
    expect(res.statusCode).toBe(403);
    expect(res.text).toContain('Not authorized to cancel this appointment.');
  });

  it('should return 409 if appointment already cancelled', async () => {
    aptModel.findById.mockResolvedValue({
      uidDoc: 'doc123',
      State: 'Cancelled',
    });

    const res = await request(app).patch(endpoint).set(headers);
    expect(res.statusCode).toBe(409);
    expect(res.text).toContain('Appointment already cancelled.');
  });

  it('should return 500 on DB error', async () => {
    aptModel.findById.mockRejectedValue(new Error('DB error'));
    const res = await request(app).patch(endpoint).set(headers);
    expect(res.statusCode).toBe(500);
    expect(res.text).toContain('Internal server error.');
  });
});