const request = require('supertest');
const express = require('express');
const router = require('../../src/Patient/get/getAppointmentById'); // Adjust path as needed
const aptModel = require('../../src/Model/appointments');
const doctorModel = require('../../src/Model/doctor');

jest.mock('../../src/Model/appointments');
jest.mock('../../src/Model/doctor');

const app = express();
app.use(express.json());
app.use('/', router);

describe('GET /:id - Get appointment by ID', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and appointment with doctor name', async () => {
    const mockAppointment = {
      _id: 'apt123',
      uidDoc: 'doc1',
      Apt: new Date('2025-07-01T10:00:00Z'),
      toObject: function () {
        return {
          _id: this._id,
          uidDoc: this.uidDoc,
          Apt: this.Apt,
        };
      },
    };

    const mockDoctor = { uid: 'doc1', name: 'Dr. John Doe' };

    aptModel.findById.mockResolvedValue(mockAppointment);
    doctorModel.findOne.mockResolvedValue(mockDoctor);

    const res = await request(app).get('/apt123');

    expect(res.statusCode).toBe(200);
    expect(res.body.doctorName).toBe('Dr. John Doe');
    expect(res.body.uidDoc).toBe('doc1');
  });

  it('should return 404 if appointment not found', async () => {
    aptModel.findById.mockResolvedValue(null);

    const res = await request(app).get('/nonexistent-id');

    expect(res.statusCode).toBe(404);
    expect(res.text).toBe('Appointment not found');
  });

  it('should return 200 with "Unknown Doctor" if doctor not found', async () => {
    const mockAppointment = {
      _id: 'apt124',
      uidDoc: 'doc999',
      Apt: new Date('2025-07-01T10:00:00Z'),
      toObject: function () {
        return {
          _id: this._id,
          uidDoc: this.uidDoc,
          Apt: this.Apt,
        };
      },
    };

    aptModel.findById.mockResolvedValue(mockAppointment);
    doctorModel.findOne.mockResolvedValue(null); // no doctor found

    const res = await request(app).get('/apt124');

    expect(res.statusCode).toBe(200);
    expect(res.body.doctorName).toBe('Unknown Doctor');
  });

  it('should return 500 on internal server error', async () => {
    aptModel.findById.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/any-id');

    expect(res.statusCode).toBe(500);
    expect(res.text).toBe('Internal server error');
  });
});