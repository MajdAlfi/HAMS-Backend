// tests/appointments.test.js
const request = require('supertest');
const app = require('../../src/App/app');
const aptModel = require('../../srcModel/appointments');

jest.mock('../../src/Model/appointments');
jest.mock('../../src/middleware/authCheck'); // use the mock auth

describe('POST /appointments', () => {
  const endpoint = '/appointments';
  const headers = { uid: 'patient123' };

  const validPayload = {
    aptDate: '2025-06-01',
    uidDoc: 'doctor456',
    desc: 'Follow-up visit',
    HName: 'City Hospital'
  };

  beforeEach(() => {
    aptModel.create.mockClear();
  });

  it('should return 200 and "Done" when appointment is created', async () => {
    aptModel.create.mockResolvedValue({});

    const res = await request(app)
      .post(endpoint)
      .set(headers)
      .send(validPayload);

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Done');
    expect(aptModel.create).toHaveBeenCalledTimes(1);
    expect(aptModel.create).toHaveBeenCalledWith({
      Apt: validPayload.aptDate,
      uidDoc: validPayload.uidDoc,
      uidPatient: headers.uid,
      Hospital: validPayload.HName,
      State: 'Confirmed',
      descPatient: validPayload.desc,
      diagnosis: '',
    });
  });

  it('should return 400 when aptModel.create throws', async () => {
    aptModel.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post(endpoint)
      .set(headers)
      .send(validPayload);

    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('DB error');
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post(endpoint)
      .set(headers)
      .send({}); // empty body

    expect(res.statusCode).toBe(400); // optional improvement: add field validation in your route
  });
});