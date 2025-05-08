const request = require("supertest");
const app = require("../../src/App/app");
const path = require("path");

describe("POST /register", () => {
  it("should register a doctor and return a token", async () => {
    const imagePath = path.join(__dirname, "../fixtures/sample.jpg");

    const res = await request(app)
      .post("/register")
      .field("phoneNo", "1234567890")
      .field("password", "securepass")
      .field("address", "123 Main St")
      .field("Gender", "Male")
      .field("DOB", "1990-01-01")
      .field("Name", "John Doe")
      .field("accountType", "Doctor")
      .field("isDoc", "true")
      .field("Specialization", "Cardiology")
      .field("Hospital", "City Hospital")
      .attach("img", imagePath);

    expect(res.statusCode).toBe(200);
    expect(typeof res.text).toBe("string");
    expect(res.text.length).toBeGreaterThan(10); // token is a string
  });
});