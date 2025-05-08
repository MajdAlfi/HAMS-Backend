const request = require("supertest");
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Route
const registerRoute = require("../../src/Auth/post/register");

// Mocks
jest.mock("../../src/Model/user");
jest.mock("../../src/Model/doctor");
jest.mock("../../src/Model/weeklySchedule");
jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
}));
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mock-jwt-token"),
}));

const User = require("../../src/Model/user");
const Doctor = require("../../src/Model/doctor");
const Weekly = require("../../src/Model/weeklySchedule");

const app = express();
app.use(express.json());
app.use("/register", registerRoute);

describe("POST /register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register a doctor and return a token", async () => {
    const testImagePath = path.join(__dirname, "../fixtures/sample.jpg");

    // Mock DB results
    User.findOne.mockResolvedValue(null);
    Doctor.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ _id: "user123", Name: "Alice" });
    Doctor.create.mockResolvedValue({});
    Weekly.create.mockResolvedValue({});

    const res = await request(app)
      .post("/register")
      .field("phoneNo", "1234567890")
      .field("password", "securePass")
      .field("address", "123 St")
      .field("Gender", "Female")
      .field("DOB", "1990-01-01")
      .field("Name", "Alice")
      .field("accountType", "Doctor")
      .field("isDoc", "true")
      .field("Specialization", "Cardiology")
      .field("Hospital", "HealthCare Center")
      .attach("img", testImagePath);

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("mock-jwt-token");
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app).post("/register").send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain("All inputs are required");
  });

  it("should return 409 if user already exists", async () => {
    User.findOne.mockResolvedValue({ phoneNo: "1234567890" });

    const res = await request(app)
      .post("/register")
      .field("phoneNo", "1234567890")
      .field("password", "securePass")
      .field("address", "123 St")
      .field("Gender", "Female")
      .field("DOB", "1990-01-01")
      .field("Name", "Alice")
      .field("accountType", "Doctor")
      .field("isDoc", "false");

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toContain("User Already exists");
  });
});