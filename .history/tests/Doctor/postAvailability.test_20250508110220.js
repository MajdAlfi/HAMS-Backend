const request = require('supertest');
const express = require('express');
const router = require('../../src/Doctor/post/postAvailability'); // Adjust path as needed

const WeeklySchedule = require('../../src/Model/weeklySchedule');
const SpecialOccations = require('../../src/Model/specialOccations');

jest.mock('../../src/Model/weeklySchedule');
jest.mock('../../src/Model/specialOccations');
jest.mock('../../src/middleware/authCheck', () => (req, res, next) => {
  req.headers.uid = 'doctor123';
  next();
});

const app = express();
app.use(express.json());
app.use('/', router);

describe('Weekly Schedule & Special Occasions API', () => {
  const headers = { uid: 'doctor123' };

  beforeEach(() => jest.clearAllMocks());

  it('GET / - should return weekly and special data', async () => {
    WeeklySchedule.findOne.mockResolvedValue({ uid: 'doctor123', Monday: true });
    SpecialOccations.find.mockResolvedValue([{ From: '2025-07-01', To: '2025-07-02' }]);

    const res = await request(app).get('/').set(headers);

    expect(res.statusCode).toBe(200);
    expect(res.body.weekly).toBeDefined();
    expect(res.body.specials).toBeDefined();
  });

  it('POST /saveWeeklyAvailability - creates new schedule', async () => {
    WeeklySchedule.findOne.mockResolvedValue(null);
    WeeklySchedule.create.mockResolvedValue({ uid: 'doctor123' });

    const res = await request(app).post('/saveWeeklyAvailability').set(headers).send({
      Monday: true,
      workingHourFrom: '08:00',
      workingHourTo: '16:00',
    });

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Weekly availability saved');
  });

  it('POST /saveSpecialOccasion - saves special date', async () => {
    SpecialOccations.create.mockResolvedValue({ uid: 'doctor123' });

    const res = await request(app).post('/saveSpecialOccasion').set(headers).send({
      From: '2025-07-01',
      To: '2025-07-02',
    });

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Special occasion saved');
  });

  it('DELETE /deleteSpecialOccasion - deletes occasion', async () => {
    SpecialOccations.findOneAndDelete.mockResolvedValue({ _id: 'sp1' });

    const res = await request(app)
      .delete('/deleteSpecialOccasion')
      .set(headers)
      .send({ id: 'sp1' });

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Special occasion deleted');
  });

  it('DELETE /deleteSpecialOccasion - returns 404 if not found', async () => {
    SpecialOccations.findOneAndDelete.mockResolvedValue(null);

    const res = await request(app)
      .delete('/deleteSpecialOccasion')
      .set(headers)
      .send({ id: 'invalid-id' });

    expect(res.statusCode).toBe(404);
    expect(res.text).toBe('Special occasion not found');
  });
});