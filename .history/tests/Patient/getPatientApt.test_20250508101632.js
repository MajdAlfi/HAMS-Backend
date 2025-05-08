const request = require('supertest');
const express = require('express');
const router = require('../../src/Patient/get/getAppointments'); // Adjust path
const aptModel = require('../../src/Model/appointments');

// ✅ Mock dependencies
jest.mock('../../src/Model/appointments');
jest.mock('../../src/middleware/authCheck', () => (req, res, next) => {
  req.user = { id: 'test-user-id' };
  next();
});

// ✅ Setup Express test app
const app = express();
app.use(express.json());
app.use('/getApt', router);

describe('GET /getApt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return appointments for user', async () => {
    const mockAppointments = [
      { uid: 'test-user-id', Apt: new Date('2025-07-01T10:00:00Z') },
      { uid: 'test-user-id', Apt: new Date('2025-07-02T14:00:00Z') },
    ];
    aptModel.find.mockResolvedValue(mockAppointments);

    const res = await request(app).get('/getAppointments').set({ uid: 'test-user-id' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expect.arrayContaining(mockAppointments));
    expect(aptModel.find).toHaveBeenCalledWith({ uid: 'test-user-id' });
  });

  it('should return 400 on DB error', async () => {
    aptModel.find.mockRejectedValue(new Error('DB Error'));

    const res = await request(app).get('/getAppointments').set({ uid: 'test-user-id' });

    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('An Error occurred');
  });
});