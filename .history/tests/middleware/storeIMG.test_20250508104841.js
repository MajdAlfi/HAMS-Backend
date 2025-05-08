const request = require("supertest");
const express = require("express");
const path = require("path");
const fs = require("fs");
const uploadRouter = require('../../src/middleware/getIMGs');

const app = express();
app.use("/", uploadRouter);

describe("POST /upload-doc-image", () => {
  const testImagePath = path.join(__dirname, "../fixtures/sample.jpg"); // add your test image in /tests/fixtures

  it("should upload a file and respond with the filename", async () => {
    const res = await request(app)
      .post("/upload-doc-image")
      .attach("image", testImagePath);

    expect(res.statusCode).toBe(200);
    expect(res.body.filename).toMatch(/\.jpg$/);
  });

  it("should return 400 if no file is uploaded", async () => {
    const res = await request(app).post("/upload-doc-image");

    expect(res.statusCode).toBe(400);
    expect(res.text).toBe("No file uploaded.");
  });
});