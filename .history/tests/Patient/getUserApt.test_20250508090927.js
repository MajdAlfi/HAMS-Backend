const request = require('supertest');
const app = require('../../src/App/app');

const aptModel = require('../../src/Model/appointments');
const docModel = require('../../src/Model/doctor');

// Mocks
jest.mock('../../src/Model/appointments');
jest.mock('../../src/Model/doctor');

describe('GET /getUserAppointments', () => {
  const endpoint = '/getUserAppointments';
  const headers = { uid: 'patient123' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and enriched appointments', async () => {
    aptModel.find.mockResolvedValue([
      {
        uidPatient: 'patient123',
        uidDoc: 'doc1',
        Apt: new Date('2025-07-10T09:00:00Z'),
        toObject: function () {
          return {
            uidPatient: this.uidPatient,
            uidDoc: this.uidDoc,
            Apt: this.Apt,
          };
        },
      },
    ]);

    docModel.find.mockResolvedValue([
      {
        uid: 'doc1',
        name: 'Dr. Smith',
      },
    ]);

    const res = await request(app).get(endpoint).set(headers);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].doctorName).toBe('Dr. Smith');
  });

  it('should return 400 if uid is missing', async () => {
    const res = await request(app).get(endpoint);
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('Missing uid');
  });

  it('should return 500 on server error', async () => {
    aptModel.find.mockRejectedValue(new Error('DB failure'));

    const res = await request(app).get(endpoint).set(headers);
    expect(res.statusCode).toBe(500);
    expect(res.text).toContain('Internal server error');
  });
});