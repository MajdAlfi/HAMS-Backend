const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const router = require('./router'); // Path to your router file
const aptModel = require('../../Model/appointments');
const docModel = require('../../Model/doctor');

// Mock the auth middleware
jest.mock('../../middleware/authCheck', () => (req, res, next) => {
  req.headers.uid = 'test-user-id'; // Simulate authenticated user
  next();
});

// Set up Express app for testing
const app = express();
app.use(express.json());
app.use(router);

describe('GET / - Appointment History', () => {
  beforeAll(async () => {
    // Connect to in-memory MongoDB
    await mongoose.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterEach(async () => {
    // Clear collections after each test
    await aptModel.deleteMany({});
    await docModel.deleteMany({});
  });

  afterAll(async () => {
    // Close MongoDB connection
    await mongoose.connection.close();
  });

  it('should return appointment history and doctor details', async () => {
    // Seed test data
    const doctor = await docModel.create({
      uid: 'doc1',
      name: 'Dr. John Doe',
      img: 'doctor.jpg',
    });

    const appointment = await aptModel.create({
      uidPatient: 'test-user-id',
      uidDoc: 'doc1',
      Apt: new Date('2025-05-01'),
    });

    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      listNames: [{ name: 'Dr. John Doe', img: 'doctor.jpg' }],
      listAptHistory: [
        expect.objectContaining({
          uidPatient: 'test-user-id',
          uidDoc: 'doc1',
        }),
      ],
    });
  });

  it('should return empty lists when no appointments exist', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      listNames: [],
      listAptHistory: [],
    });
  });

  it('should handle missing doctor with Unknown entry', async () => {
    await aptModel.create({
      uidPatient: 'test-user-id',
      uidDoc: 'nonexistent-doc',
      Apt: new Date('2025-05-01'),
    });

    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body.listNames).toEqual([{ name: 'Unknown', img: '' }]);
    expect(response.body.listAptHistory).toHaveLength(1);
  });

  it('should return 400 on database error', async () => {
    // Mock a database error by temporarily overriding find
    jest.spyOn(aptModel, 'find').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const response = await request(app).get('/');

    expect(response.status).toBe(400);
    expect(response.body).toBe('An Error occurred');
  });

  it('should handle unauthorized access', async () => {
    // Override auth middleware to simulate unauthorized access
    jest.spyOn(require('../../middleware/authCheck'), 'mockImplementation').mockImplementation((req, res, next) => {
      res.status(401).send('Unauthorized');
    });

    const response = await request(app).get('/');

    expect(response.status).toBe(401);
    expect(response.body).toBe('Unauthorized');
  });
});