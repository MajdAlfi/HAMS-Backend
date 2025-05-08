const request = require("supertest");
const express = require("express");
const path = require("path");
const uploadRoute = require("./tempUploadRoute"); // import the test route above

const app = express();
app.use("/", uploadRoute);

describe("POST /test-upload", () => {
  const testImagePath = path.join(__dirname, "../fixtures/sample.jpg"); // make sure this file exists

  it("should upload a file and respond with the filename", async () => {
    const res = await request(app)
      .post("/test-upload")
      .attach("image", testImagePath);

    expect(res.statusCode).toBe(200);
    expect(res.body.filename).toMatch(/\.jpg$/);
  });

  it("should return 400 if no file is uploaded", async () => {
    const res = await request(app).post("/test-upload");
    expect(res.statusCode).toBe(400);
    expect(res.text).toBe("No file uploaded.");
  });
});