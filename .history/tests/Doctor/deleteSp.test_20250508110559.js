const request = require('supertest');
const express = require('express');
const router = require('../../src/Doctor/get/getDocAva'); 
const weeklyModel = require('../../src/Model/weeklySchedule');
const specialModel = require('../../src/Model/specialOccations');

// Mocks
jest.mock('../../src/Model/weeklySchedule');
jest.mock('../../src/Model/specialOccations');

// Setup express app
const app = express();
app.use(express.json());
app.use('/getAvailability', router);

describe('GET /getAvailability', () => {
  const endpoint = '/getAvailability';
  const headers = { uid: 'doc123' };

  beforeEach(() => jest.clearAllMocks());

  it('should return 200 and availability data', async () => {
    weeklyModel.findOne.mockResolvedValue({ uid: 'doc123', Monday: true });
    specialModel.find.mockResolvedValue([{ From: '2025-07-01', To: '2025-07-02' }]);

    const res = await request(app).get(endpoint).set(headers);

    expect(res.statusCode).toBe(200);
    expect(res.body.weekly).toBeDefined();
    expect(res.body.specials).toBeDefined();
  });

  it('should return 400 if uid is missing', async () => {
    const res = await request(app).get(endpoint);
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('Missing uid');
  });

  it('should return 404 if weekly availability not found', async () => {
    weeklyModel.findOne.mockResolvedValue(null);

    const res = await request(app).get(endpoint).set(headers);
    expect(res.statusCode).toBe(404);
    expect(res.text).toContain('No weekly availability found');
  });

  it('should return 500 on server error', async () => {
    weeklyModel.findOne.mockRejectedValue(new Error('DB failure'));

    const res = await request(app).get(endpoint).set(headers);
    expect(res.statusCode).toBe(500);
    expect(res.text).toContain('Internal server error');
  });
});