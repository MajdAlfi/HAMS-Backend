const request = require('supertest');
const app = require('../../src/App/app');
const aptModel = require('../../src/Model/appointments');

// ✅ Mock dependencies
jest.mock('../../src/Model/appointments');
jest.mock('../../src/middleware/authCheck', () => (req, res, next) => {
  req.user = { id: 'test-user' };
  next();
});

describe('POST /getsuggest', () => {
  const validPayload = {
    aptDate: '2025-06-01',
    uidDoc: 'doctor456',
    desc: 'Follow-up visit',
    HName: 'City Hospital',
  };

  const headers = { uid: 'patient123' };

  beforeEach(() => {
    aptModel.create.mockClear();
  });


  it('should return 200 and "Done" when appointment is created', async () => {
    aptModel.create.mockResolvedValue({});

    const res = await request(app)
      .post('/getsuggest')
      .set(headers)
      .send(validPayload);

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Done');
    expect(aptModel.create).toHaveBeenCalledTimes(1);
  });

  it('should return 400 when aptModel.create throws', async () => {
    aptModel.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/getsuggest')
      .set(headers)
      .send(validPayload);

    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('DB error');
  });

  it('should return 400 if required fields are missing', async () => {
    aptModel.create.mockRejectedValue(new Error('Missing fields'));

    const res = await request(app)
      .post('/getsuggest')
      .set(headers)
      .send({}); // Missing fields

    expect(res.statusCode).toBe(400);
  });
});