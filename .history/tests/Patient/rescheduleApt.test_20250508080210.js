const request = require('supertest');
const app = require('../../App/app');

const aptModel = require('../../Model/appointments');
const scheduleModel = require('../../Model/weeklySchedule');
const specialModel = require('../../Model/specialOccations');

jest.mock('../../Model/appointments');
jest.mock('../../Model/weeklySchedule');
jest.mock('../../Model/specialOccations');

// Mock auth middleware to always pass
jest.mock('../../middleware/authCheck', () => (req, res, next) => {
  req.headers.uid = 'patient123'; // simulate authenticated user
  next();
});

const dayjs = require('dayjs');

describe('PATCH /rescheduleAppointment/:id', () => {
  const appointmentId = '123';
  const newDate = '2025-06-10T10:00:00.000Z'; // Tuesday
  const dayName = dayjs(newDate).format('dddd'); // "Tuesday"

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 if rescheduling is successful', async () => {
    aptModel.findById.mockResolvedValue({
      _id: appointmentId,
      uidPatient: 'patient123',
      uidDoc: 'doctor456',
      Apt: new Date(),
      save: jest.fn().mockResolvedValue({}),
    });

    scheduleModel.findOne.mockResolvedValue({
      uid: 'doctor456',
      [dayName]: true,
      workingHourFrom: '09:00 AM',
      workingHourTo: '05:00 PM',
    });

    specialModel.findOne.mockResolvedValue(null);
    aptModel.findOne.mockResolvedValue(null); // no conflicts

    const res = await request(app)
      .patch(`/rescheduleAppointment/${appointmentId}`)
      .set('uid', 'patient123')
      .send({ newDate });

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Appointment rescheduled successfully');
  });

  it('should return 400 if newDate is missing', async () => {
    const res = await request(app)
      .patch(`/rescheduleAppointment/${appointmentId}`)
      .set('uid', 'patient123')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('Missing new appointment date');
  });

  it('should return 404 if appointment not found', async () => {
    aptModel.findById.mockResolvedValue(null);

    const res = await request(app)
      .patch(`/rescheduleAppointment/${appointmentId}`)
      .set('uid', 'patient123')
      .send({ newDate });

    expect(res.statusCode).toBe(404);
    expect(res.text).toContain('Appointment not found');
  });

  it('should return 403 if uid does not match patient ID', async () => {
    aptModel.findById.mockResolvedValue({
      _id: appointmentId,
      uidPatient: 'different-user',
      uidDoc: 'doctor456',
    });

    const res = await request(app)
      .patch(`/rescheduleAppointment/${appointmentId}`)
      .set('uid', 'patient123')
      .send({ newDate });

    expect(res.statusCode).toBe(403);
    expect(res.text).toContain('Not authorized');
  });

  it('should return 409 if doctor not available that day', async () => {
    aptModel.findById.mockResolvedValue({
      _id: appointmentId,
      uidPatient: 'patient123',
      uidDoc: 'doctor456',
    });

    scheduleModel.findOne.mockResolvedValue({
      uid: 'doctor456',
      // no dayName here means doctor unavailable
      workingHourFrom: '09:00 AM',
      workingHourTo: '05:00 PM',
    });

    const res = await request(app)
      .patch(`/rescheduleAppointment/${appointmentId}`)
      .set('uid', 'patient123')
      .send({ newDate });

    expect(res.statusCode).toBe(409);
    expect(res.text).toContain('Doctor is not available on this day');
  });

  it('should return 409 if doctor is on leave', async () => {
    aptModel.findById.mockResolvedValue({
      _id: appointmentId,
      uidPatient: 'patient123',
      uidDoc: 'doctor456',
    });

    scheduleModel.findOne.mockResolvedValue({
      uid: 'doctor456',
      [dayName]: true,
      workingHourFrom: '09:00 AM',
      workingHourTo: '05:00 PM',
    });

    specialModel.findOne.mockResolvedValue({
      uid: 'doctor456',
      From: new Date('2025-06-09'),
      To: new Date('2025-06-11'),
    });

    const res = await request(app)
      .patch(`/rescheduleAppointment/${appointmentId}`)
      .set('uid', 'patient123')
      .send({ newDate });

    expect(res.statusCode).toBe(409);
    expect(res.text).toContain('Doctor is on leave');
  });
});