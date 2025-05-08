const request = require('supertest');
const app = require('../../src/App/app');

const aptModel = require('../../src/Model/appointments');
const docModel = require('../../src/Model/doctor');


jest.mock('../../src/Model/appointments');
jest.mock('../../src/Model/doctor');
jest.mock('../../src/middleware/authCheck', () => (req, res, next) => {

  req.headers.uid = 'patient123';
  token = 'eeee'
  next();
});

describe('GET /getPatHistory', () => {
  const endpoint = '/getPatHistory';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and appointment history with doctor names and images', async () => {
    aptModel.find.mockResolvedValue([
      { uidDoc: 'doc1', Apt: new Date('2025-07-10T09:00:00Z') },
      { uidDoc: 'doc2', Apt: new Date('2025-07-05T10:00:00Z') },
    ]);

    docModel.findOne
      .mockResolvedValueOnce({ name: 'Dr. Smith', img: 'img1.jpg' })
      .mockResolvedValueOnce({ name: 'Dr. Jane', img: 'img2.jpg' });

    const res = await request(app).get(endpoint).set({ uid: 'patient123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.listNames).toEqual([
      { name: 'Dr. Smith', img: 'img1.jpg' },
      { name: 'Dr. Jane', img: 'img2.jpg' },
    ]);
    expect(res.body.listAptHistory.length).toBe(2);
  });

  it('should handle missing doctor info gracefully', async () => {
    aptModel.find.mockResolvedValue([
      { uidDoc: 'doc1', Apt: new Date('2025-07-10T09:00:00Z') }
    ]);
    docModel.findOne.mockResolvedValue(null); // simulate missing doctor

    const res = await request(app).get(endpoint).set({ uid: 'patient123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.listNames).toEqual([{ name: 'Unknown', img: '' }]);
  });

  it('should return 400 on error', async () => {
    aptModel.find.mockRejectedValue(new Error('DB failure'));

    const res = await request(app).get(endpoint).set({ uid: 'patient123' });

    expect(res.statusCode).toBe(400);
    expect(res.text).toContain('An Error occurred');
  });
});