const request = require('supertest');
const app = require('../../src/App/app');

const aptModel = require('../../src/Model/appointments');
const specialModel = require('../../src/Model/specialOccations');
const weeklyModel = require('../../src/Model/weeklySchedule');

// Mocks
jest.mock('../../src/Model/appointments');
jest.mock('../../src/Model/specialOccations');
jest.mock('../../src/Model/weeklySchedule');

// Mock auth middleware
jest.mock('../../src/middleware/authCheck', () => (req, res, next) => {
  req.user = { id: 'patient123' }; // from decoded JWT
  next();
});

describe('POST /bookApt', () => {
  const endpoint = '/bookApt';
  const headers = { uid: 'patient123' };
  const validPayload = {
    aptDate: '2025-07-09T10:00:00Z', // this is a Wednesday
    uidDoc: 'doctor456',
    desc: 'Follow-up',
    HName: 'City Hospital',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 when appointment is successfully created', async () => {
    weeklyModel.findOne.mockResolvedValue({ Wednesday: true });
    specialModel.findOne.mockResolvedValue(null);
    aptModel.findOne.mockResolvedValue(null); // no conflicts
    aptModel.create.mockResolvedValue({});

    const res = await request(app)
      .post(endpoint)
      .set(headers)
      .send(validPayload);

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Appointment created successfully');
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app).post(endpoint).set(headers).send({});
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('Missing required fields');
  });

  it('should return 409 if doctor not available that day', async () => {
    weeklyModel.findOne.mockResolvedValue({ Wednesday: false });

    const res = await request(app)
      .post(endpoint)
      .set(headers)
      .send(validPayload);

    expect(res.statusCode).toBe(409);
    expect(res.text).toContain('Doctor is not available');
  });

  it('should return 409 if doctor has a special occasion', async () => {
    weeklyModel.findOne.mockResolvedValue({ Wednesday: true });
    specialModel.findOne.mockResolvedValue({});

    const res = await request(app)
      .post(endpoint)
      .set(headers)
      .send(validPayload);

    expect(res.statusCode).toBe(409);
    expect(res.text).toContain('special occasion');
  });

  it('should return 409 if doctor is already booked', async () => {
    weeklyModel.findOne.mockResolvedValue({ Wednesday: true });
    specialModel.findOne.mockResolvedValue(null);
    aptModel.findOne
      .mockResolvedValueOnce({}) // doctor is busy
      .mockResolvedValueOnce(null);

    const res = await request(app)
      .post(endpoint)
      .set(headers)
      .send(validPayload);

    expect(res.statusCode).toBe(409);
    expect(res.text).toContain('Doctor already has an appointment');
  });

  it('should return 409 if patient is already booked at that time', async () => {
    weeklyModel.findOne.mockResolvedValue({ Wednesday: true });
    specialModel.findOne.mockResolvedValue(null);
  
    aptModel.findOne.mockImplementation((query) => {
      if (query.uidDoc) return null; // doctor is available
      if (query.uidPatient) return { uidPatient: 'patient123' }; // patient is booked
      return null;
    });
  
    const res = await request(app)
      .post(endpoint)
      .set(headers)
      .send(validPayload);
  
    expect(res.statusCode).toBe(409);
    expect(res.text).toContain('You already have an appointment');
  });
  it('should return 500 on DB error', async () => {
    weeklyModel.findOne.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post(endpoint)
      .set(headers)
      .send(validPayload);

    expect(res.statusCode).toBe(500);
    expect(res.text).toContain('Internal server error');
  });
});