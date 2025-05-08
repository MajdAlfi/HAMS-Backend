const request = require('supertest');
const express = require('express');
const router = require('../../src/Doctor/post/createDoc');

const userModel = require('../../src/Model/user');
const docModel = require('../../src/Model/doctor');

// Mocks
jest.mock('../../src/Model/user');
jest.mock('../../src/Model/doctor');
jest.mock('../../src/middleware/authCheck', () => (req, res, next) => {
  req.user = { id: 'doc123' };
  next();
});

// Setup app
const app = express();
app.use(express.json());
app.use('/', router);

describe('POST / (create doctor profile)', () => {
  const payload = {
    uid: 'doc123',
    Hospital: 'City Hospital',
    img: 'doctor.jpg',
    desc: 'Experienced cardiologist',
  };

  beforeEach(() => jest.clearAllMocks());

  it('should create doctor profile and return 200', async () => {
    userModel.find.mockResolvedValue([{ name: 'Alice' }]);
    docModel.create.mockResolvedValue({}); // simulate successful creation

    const res = await request(app).post('/').send(payload);

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Done');
    expect(docModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        uid: 'doc123',
        name: 'Dr. Alice',
        Hospital: 'City Hospital',
        img: 'doctor.jpg',
        desc: 'Experienced cardiologist',
      })
    );
  });

  it('should return 400 if error occurs', async () => {
    userModel.find.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/').send(payload);

    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('DB error');
  });
});