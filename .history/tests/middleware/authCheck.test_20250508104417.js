const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const verifyToken = require('../../src/middleware/authCheck'); // Adjust path as needed

jest.mock('jsonwebtoken');

describe('verifyToken middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use((req, res, next) => {
      // inject middleware
      verifyToken(req, res, next);
    });
    app.get('/', (req, res) => res.status(200).send('OK'));
  });

  it('should return 403 if token or uid is missing', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(403);
    expect(res.text).toBe('A token/uid is required for authentication!');
  });

  it('should return 401 if token is invalid', async () => {
    const token = 'invalid.token.value';
    const res = await request(app)
      .get('/')
      .set('token', token)
      .set('uid', 'user123');

    expect(res.status).toBe(401);
    expect(res.text).toBe('Invalid_Token');
  });

  it('should return 401 if decoded user_id does not match uid', async () => {
    const validPayload = { user_id: 'wrong-user' };
    const token = createFakeJWT(validPayload);

    jwt.verify.mockReturnValue(validPayload);

    const res = await request(app)
      .get('/')
      .set('token', token)
      .set('uid', 'user123');

    expect(res.status).toBe(401);
    expect(res.text).toBe('Invalid_Token/userId');
  });

  it('should allow request if token and uid are valid', async () => {
    const payload = { user_id: 'user123' };
    const token = createFakeJWT(payload);

    jwt.verify.mockReturnValue(payload);

    const res = await request(app)
      .get('/')
      .set('token', token)
      .set('uid', 'user123');

    expect(res.status).toBe(200);
    expect(res.text).toBe('OK');
  });
});

// Helper to create a fake JWT-like token (doesn't have to be valid for signature)
function createFakeJWT(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64');
  return `${header}.${body}.signature`;
}