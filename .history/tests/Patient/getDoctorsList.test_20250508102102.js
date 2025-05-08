const request = require('supertest');
const express = require('express');
const router = require('../../src/Patient/get/getDoctorsList'); // Adjust the path as needed
const doctorsModel = require('../../src/Model/doctor');

jest.mock('../../src/Model/doctor');

const app = express();
app.use(express.json());
app.use('/', router);

describe('GET /getDocList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and list of doctors', async () => {
    const mockDoctors = [
      { uid: 'doc1', name: 'Dr. Alice' },
      { uid: 'doc2', name: 'Dr. Bob' }
    ];

    doctorsModel.find.mockResolvedValue(mockDoctors);

    const res = await request(app).get('/');

    expect(res.statusCode).toBe(200);
    expect(res.body.dataDoc).toEqual(mockDoctors);
    expect(doctorsModel.find).toHaveBeenCalledTimes(1);
  });

  it('should return 400 on DB error', async () => {
    doctorsModel.find.mockRejectedValue(new Error('DB Error'));

    const res = await request(app).get('/');

    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('DB Error');
  });
});