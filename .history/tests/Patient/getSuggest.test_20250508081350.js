const request = require('supertest');
const app = require('../../src/App/app');

const weekModel = require('../../src/Model/weeklySchedule');
const doctorModel = require('../../src/Model/doctor');
const specialModel = require('../../src/Model/specialOccations');
const aptModel = require('../../src/Model/appointments');

// Mocks
jest.mock('../../src/Model/weeklySchedule');
jest.mock('../../src/Model/doctor');
jest.mock('../../src/Model/specialOccations');
jest.mock('../../src/Model/appointments');

describe('GET /getsuggest', () => {
  const headers = { uid: 'patient123' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and a list of suggestions', async () => {
    const doctorId = 'doc1';
    const dateNow = new Date();
    const fakeSlot = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    weekModel.aggregate.mockResolvedValue([
      {
        uid: doctorId,
        Monday: true,
        workingHourFrom: '09:00 AM',
        workingHourTo: '05:00 PM',
      },
    ]);

    doctorModel.findOne.mockResolvedValue({
      uid: doctorId,
      name: 'Dr. Smith',
      Hospital: 'City Hospital',
      desc: 'General Physician',
    });

    specialModel.findOne.mockResolvedValue(null); // doctor not on leave

    aptModel.findOne.mockResolvedValue(null); // no conflicts

    const res = await request(app)
      .get('/getsuggest')
      .set(headers);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('doctorName');
    expect(res.body[0]).toHaveProperty('time');
  });

  it('should return 400 if uid is missing', async () => {
    const res = await request(app).get('/getsuggest');
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('Missing uidPatient');
  });

  it('should return 404 if no suggestions are found', async () => {
    weekModel.aggregate.mockResolvedValue([]);
    const res = await request(app).get('/getsuggest').set(headers);
    expect(res.statusCode).toBe(404);
    expect(res.text).toContain('No appointment suggestions');
  });

  it('should return 500 if an error is thrown', async () => {
    weekModel.aggregate.mockRejectedValue(new Error('Something went wrong'));
    const res = await request(app).get('/getsuggest').set(headers);
    expect(res.statusCode).toBe(500);
    expect(res.text).toContain('Internal server error');
  });
});