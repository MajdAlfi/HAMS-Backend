const request = require('supertest');
const express = require('express');
const router = require('../../src/Doctor/get/getDocAva'); // adjust path if needed
const weekModel = require('../../src/Model/weeklySchedule');

jest.mock('../../src/Model/weeklySchedule'); 

const app = express();
app.use(express.json());
app.use('/getWeeklySchedule', router); 

describe('GET /getWeeklySchedule', () => {
  const endpoint = '/getWeeklySchedule';
  const headers = { uid: 'doc123' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and weekly schedule data', async () => {
    const mockData = [
      {
        uid: 'doc123',
        Monday: true,
        workingHourFrom: '08:00',
        workingHourTo: '16:00',
      },
    ];

    weekModel.find.mockResolvedValue(mockData); // ✅ Resolve mock

    const res = await request(app).get(endpoint).set(headers);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ dataWeek: mockData });
  });

  it('should return 400 on DB error', async () => {
    weekModel.find.mockRejectedValue(new Error('DB Error')); 

    const res = await request(app).get(endpoint).set(headers);

    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('DB Error');
  });

  it('should return 400 if uid is missing', async () => {
    const res = await request(app).get(endpoint);
    
    expect(res.statusCode).toBe(200); 
  });
});