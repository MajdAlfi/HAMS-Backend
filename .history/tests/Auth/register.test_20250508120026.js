const request = require("supertest");
const path = require("path");
const fs = require("fs");
const app = require("../../src/App/app");

jest.mock("../../src/Model/user");
jest.mock("../../src/Model/doctor");
jest.mock("../../src/Model/weeklySchedule");

const User = require("../../src/Model/user");
const Doctor = require("../../src/Model/doctor");
const Weekly = require("../../src/Model/weeklySchedule");

describe("POST /register", () => {
  const endpoint = "/register";
  const sampleImage = path.join(__dirname, "../fixtures/sample.jpg");

  beforeAll(() => {
    if (!fs.existsSync(sampleImage)) {
      throw new Error("Test image not found at: " + sampleImage);
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register a doctor and return a token", async () => {
    // Mock user doesn't exist
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      _id: "user123",
      Name: "John",
      phoneNo: "9999999999",
    });
    Doctor.create.mockResolvedValue({});
    Weekly.create.mockResolvedValue({});

    const res = await request(app)
      .post(endpoint)
      .field("phoneNo", "9999999999")
      .field("password", "securepass")
      .field("address", "123 Test Street")
      .field("Gender", "Male")
      .field("DOB", "1990-01-01")
      .field("Name", "Dr. John")
      .field("accountType", "Doctor")
      .field("isDoc", "true")
      .field("Specialization", "Cardiology")
      .field("Hospital", "General Hospital")
      .attach("img", sampleImage);

    expect(res.statusCode).toBe(200);
    expect(typeof res.text).toBe("string"); // JWT token
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app)
      .post(endpoint)
      .field("phoneNo", "") // missing required fields

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/All inputs are required/);
  });

  it("should return 409 if user already exists", async () => {
    User.findOne.mockResolvedValue({ phoneNo: "9999999999" }); // simulate existing user

    const res = await request(app)
      .post(endpoint)
      .field("phoneNo", "9999999999")
      .field("password", "securepass")
      .field("address", "123 Test Street")
      .field("Gender", "Male")
      .field("DOB", "1990-01-01")
      .field("Name", "DuplicateUser")
      .field("accountType", "Doctor")
      .field("isDoc", "false")
      .attach("img", sampleImage);

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/User Already exists/);
  });
});