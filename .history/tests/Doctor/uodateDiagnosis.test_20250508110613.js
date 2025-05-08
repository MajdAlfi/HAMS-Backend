const request = require('supertest');
const express = require('express');
const router = require('../../src/Doctor/post/uodateDiagnosis'); 
const aptModel = require('../../src/Model/appointments');
const userModel = require('../../src/Model/user');

// Mocks
jest.mock('../../src/Model/appointments');
jest.mock('../../src/Model/user');
jest.mock('../../src/middleware/authCheck', () => (req, res, next) => {
  req.headers.uid = 'doctor123'; // Simulate doctor
  next();
});

// Express app setup
const app = express();
app.use(express.json());
app.use('/', router);

describe('PATCH /:aptId - Update Diagnosis', () => {
  const aptId = 'apt123';
  const url = `/${aptId}`;
  const headers = { uid: 'doctor123' };

  beforeEach(() => jest.clearAllMocks());

  it('should update diagnosis successfully', async () => {
    userModel.findById.mockResolvedValue({ _id: 'doctor123', accountType: 'Doctor' });
    aptModel.findByIdAndUpdate.mockResolvedValue({ _id: aptId, diagnosis: 'Flu' });

    const res = await request(app).patch(url).set(headers).send({ diagnosis: 'Flu' });

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Diagnosis updated successfully.');
  });

  it('should return 400 if diagnosis is missing', async () => {
    const res = await request(app).patch(url).set(headers).send({});
    expect(res.statusCode).toBe(400);
    expect(res.text).toBe('Diagnosis is required.');
  });

  it('should return 403 if user is not a doctor', async () => {
    userModel.findById.mockResolvedValue({ _id: 'doctor123', accountType: 'Patient' });

    const res = await request(app).patch(url).set(headers).send({ diagnosis: 'Cold' });

    expect(res.statusCode).toBe(403);
    expect(res.text).toBe('Only doctors are allowed to update diagnosis.');
  });

  it('should return 404 if appointment not found', async () => {
    userModel.findById.mockResolvedValue({ _id: 'doctor123', accountType: 'Doctor' });
    aptModel.findByIdAndUpdate.mockResolvedValue(null);

    const res = await request(app).patch(url).set(headers).send({ diagnosis: 'Cold' });

    expect(res.statusCode).toBe(404);
    expect(res.text).toBe('Appointment not found.');
  });

  it('should return 500 on server error', async () => {
    userModel.findById.mockRejectedValue(new Error('DB error'));

    const res = await request(app).patch(url).set(headers).send({ diagnosis: 'Cold' });

    expect(res.statusCode).toBe(500);
    expect(res.text).toBe('Server error.');
  });
});