const request = require('supertest');
const express = require('express');
const fs = require('fs');
const imageRouter = require('../../src/middleware/getIMGs');

jest.mock('fs');

const app = express();
app.use('/', imageRouter);

describe('GET /all-doc-images', () => {
  it('should return a list of image URLs', async () => {
    fs.readdir.mockImplementation((dir, callback) => {
      callback(null, ['img1.jpg', 'img2.png', 'not-an-image.txt']);
    });

    const res = await request(app).get('/all-doc-images');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      expect.stringMatching(/\/doc-images\/img1\.jpg$/),
      expect.stringMatching(/\/doc-images\/img2\.png$/),
    ]);
  });

  it('should handle read errors gracefully', async () => {
    fs.readdir.mockImplementation((dir, callback) => {
      callback(new Error('Failed to read directory'));
    });

    const res = await request(app).get('/all-doc-images');

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Failed to load images');
  });
});