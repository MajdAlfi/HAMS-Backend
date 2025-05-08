const request = require('supertest');
const app = require('../../src/App/app');
const aptModel = require('../../src/Model/appointments');

// Mock the models
jest.mock('../../src/Model/appointments');

// Mock auth middleware to simulate logged-in user
jest.mock('../../src/middleware/authCheck', () => (req, res, next) => {
  req.user = { id: 'patient123' }; // Mocked decoded token user ID
  next();
});

describe('DELETE /cancelAPt/:id', () => {
  const appointmentId = 'abc123';
  const headers = { uid: 'patient123' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 when appointment is cancelled', async () => {
    aptModel.findById.mockResolvedValue({
      _id: appointmentId,
      uidPatient: 'patient123',
    });

    aptModel.findByIdAndDelete.mockResolvedValue({});

    const res = await request(app)
      .delete(`/cancelAPt/${appointmentId}`)
      .set(headers);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Appointment cancelled successfully');
  });

  it('should return 404 if appointment is not found', async () => {
    aptModel.findById.mockResolvedValue(null);

    const res = await request(app)
      .delete(`/cancelAPt/${appointmentId}`)
      .set(headers);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Appointment not found');
  });

  it('should return 403 if user does not own the appointment', async () => {
    aptModel.findById.mockResolvedValue({
      _id: appointmentId,
      uidPatient: 'anotherUser',
    });

    const res = await request(app)
      .delete(`/cancelAPt/${appointmentId}`)
      .set(headers);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Unauthorized to cancel this appointment');
  });

  it('should return 500 if a DB error occurs', async () => {
    aptModel.findById.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .delete(`/cancelAPt/${appointmentId}`)
      .set(headers);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toContain('Internal server error');
  });
});