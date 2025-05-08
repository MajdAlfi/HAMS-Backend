const request = require("supertest");
const path = require("path");
const fs = require("fs");
const app = require("../../src/App/app"); // adjust if path differs

describe("POST /register", () => {
  const testImagePath = path.join(__dirname, "../fixtures/sample.jpg");

  beforeAll(() => {
    // Ensure sample image exists
    if (!fs.existsSync(testImagePath)) {
      throw new Error("Test image not found at: " + testImagePath);
    }
  });

  it("should register a doctor and return a token", async () => {
    const res = await request(app)
      .post("/register")
      .field("phoneNo", "9999999999")
      .field("password", "securepass")
      .field("address", "123 Test Street")
      .field("Gender", "Other")
      .field("DOB", "1995-01-01")
      .field("Name", "TestDoctor")
      .field("accountType", "Doctor")
      .field("isDoc", "true")
      .field("Specialization", "Dermatology")
      .field("Hospital", "Test Hospital")
      .attach("img", testImagePath);

    expect(res.statusCode).toBe(200);
    expect(typeof res.text).toBe("string");
    expect(res.text.length).toBeGreaterThan(10); // JWT token is returned as string
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app)
      .post("/register")
      .field("phoneNo", "9999999999");

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/All inputs are required/i);
  });

  it("should return 409 if user already exists", async () => {
    // Register once
    await request(app)
      .post("/register")
      .field("phoneNo", "8888888888")
      .field("password", "securepass")
      .field("address", "123 Test Street")
      .field("Gender", "Male")
      .field("DOB", "1990-01-01")
      .field("Name", "DuplicateUser")
      .field("accountType", "Doctor")
      .field("isDoc", "false")
      .attach("img", testImagePath);

    // Try to register same again
    const res = await request(app)
      .post("/register")
      .field("phoneNo", "8888888888")
      .field("password", "securepass")
      .field("address", "123 Test Street")
      .field("Gender", "Male")
      .field("DOB", "1990-01-01")
      .field("Name", "DuplicateUser")
      .field("accountType", "Doctor")
      .field("isDoc", "false")
      .attach("img", testImagePath);

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/User Already exists/i);
  });
});