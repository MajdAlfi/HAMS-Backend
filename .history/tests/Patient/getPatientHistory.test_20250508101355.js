const request = require('supertest');
const express = require('express');
const router = require('../../src/Patient/get/getPatientHistory'); // Adjust if needed
const aptModel = require('../../src/Model/appointments');
const docModel = require('../../src/Model/doctor');

// ✅ Mock models
jest.mock('../../src/Model/appointments');
jest.mock('../../src/Model/doctor');

// ✅ Mock auth middleware
jest.mock('../../src/middleware/authCheck', () => (req, res, next) => {
  req.user = { id: 'test-user-id' }; // Simulate authenticated user
  next();
});

// ✅ Set up express app
const app = express();
app.use(express.json());
app.use('/getPatHistory', router);

describe('GET /getPatHistory - Appointment History', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return appointment history and doctor details', async () => {
    aptModel.find.mockResolvedValue([
      { uidDoc: 'doc1', uidPatient: 'test-user-id', Apt: new Date('2025-05-01') },
    ]);

    docModel.findOne.mockResolvedValue({ name: 'Dr. John Doe', img: 'doctor.jpg' });

    const response = await request(app).get('/getPatHistory');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      listNames: [{ name: 'Dr. John Doe', img: 'doctor.jpg' }],
      listAptHistory: [
        expect.objectContaining({ uidDoc: 'doc1', uidPatient: 'test-user-id' }),
      ],
    });
  });

  it('should return empty lists when no appointments exist', async () => {
    aptModel.find.mockResolvedValue([]);

    const response = await request(app).get('/getPatHistory');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ listNames: [], listAptHistory: [] });
  });

  it('should handle missing doctor with Unknown entry', async () => {
    aptModel.find.mockResolvedValue([
      { uidDoc: 'nonexistent-doc', uidPatient: 'test-user-id', Apt: new Date('2025-05-01') },
    ]);
    docModel.findOne.mockResolvedValue(null);

    const response = await request(app).get('/getPatHistory');

    expect(response.status).toBe(200);
    expect(response.body.listNames).toEqual([{ name: 'Unknown', img: '' }]);
    expect(response.body.listAptHistory).toHaveLength(1);
  });

  it('should return 400 on database error', async () => {
    aptModel.find.mockImplementation(() => {
      throw new Error('DB error');
    });

    const response = await request(app).get('/getPatHistory');

    expect(response.status).toBe(400);
    expect(response.text).toContain('An Error occurred');
  });
});