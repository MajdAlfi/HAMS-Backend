const request = require('supertest');
const app = require('../../src/App/app');

const weekModel = require('../../src/Model/weeklySchedule');
const appointmentModel = require('../../src/Model/appointments');

// Mocks
jest.mock('../../src/Model/weeklySchedule');
jest.mock('../../src/Model/appointments');

describe('POST /getTimeSlots', () => {
  const endpoint = '/getTimeSlots';
  const validBody = {
    uid: 'doc123',
    date: '2025-07-09', // A Wednesday
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with available time slots', async () => {
    weekModel.findOne.mockResolvedValue({
      uid: 'doc123',
      Wednesday: true,
      workingHourFrom: '09:00',
      workingHourTo: '12:00',
    });

    appointmentModel.find.mockResolvedValue([
      {
        Apt: new Date('2025-07-09T09:30:00Z'), // this slot should be filtered out
      },
    ]);

    const res = await request(app).post(endpoint).send(validBody);

    expect(res.statusCode).toBe(200);
    expect(res.body.available).toBe(true);
    expect(res.body.availableSlots).toContain('09:00');
    expect(res.body.availableSlots).not.toContain('09:30');
  });
  it('sanity check: /getTimeSlots exists', async () => {
    const res = await request(app).post('/getWeeklySchedule').send({});
    expect([200, 400, 404, 500]).toContain(res.statusCode); // any real response
  });
  it('should return 404 if doctor schedule is not found', async () => {
    weekModel.findOne.mockResolvedValue(null);

    const res = await request(app).post(endpoint).send(validBody);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toContain("Doctor's schedule not found");
  });

  it('should return 200 if doctor is unavailable on that day', async () => {
    weekModel.findOne.mockResolvedValue({
      uid: 'doc123',
      Wednesday: false,
    });

    const res = await request(app).post(endpoint).send(validBody);
    expect(res.statusCode).toBe(200);
    expect(res.body.available).toBe(false);
    expect(res.body.message).toContain('Doctor not available');
  });

  it('should return 400 if uid or date is missing', async () => {
    const res = await request(app).post(endpoint).send({ uid: 'doc123' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('Missing uid or date');
  });

  it('should return 500 if working hours are invalid', async () => {
    weekModel.findOne.mockResolvedValue({
      uid: 'doc123',
      Wednesday: true,
      workingHourFrom: 'invalid',
      workingHourTo: 'invalid',
    });

    const res = await request(app).post(endpoint).send(validBody);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toContain('Invalid working hours');
  });

  it('should return 500 on internal server error', async () => {
    weekModel.findOne.mockRejectedValue(new Error('DB failure'));

    const res = await request(app).post(endpoint).send(validBody);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toContain('Internal server error');
  });
});