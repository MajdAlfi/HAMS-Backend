const request = require('supertest');
const express = require('express');
const router = require('../../src/Doctor/get/getDocAva'); // adjust path if needed
const weekModel = require('../../src/Model/weeklySchedule');

jest.mock('../../src/Model/weeklySchedule');

const app = express();
app.use(express.json());
app.use('/getDoctorSchedule', router);

describe('GET /getDoctorSchedule', () => {
  const endpoint = '/getDoctorSchedule';
  const headers = { uid: 'doc123' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and weekly schedule data', async () => {
    const mockData = [
      {
        uid: 'doc123',
        Monday: true,
        workingHourFrom: '09:00',
        workingHourTo: '17:00',
      },
    ];

    weekModel.find.mockResolvedValue(mockData);

    const res = await request(app).get(endpoint).set(headers);

    expect(res.statusCode).toBe(200);
    expect(res.body.dataWeek).toEqual(mockData);
    expect(weekModel.find).toHaveBeenCalledWith({ uid: 'doc123' });
  });

  it('should return 400 on DB error', async () => {
    weekModel.find.mockRejectedValue(new Error('DB Error'));

    const res = await request(app).get(endpoint).set(headers);

    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('DB Error');
  });
});