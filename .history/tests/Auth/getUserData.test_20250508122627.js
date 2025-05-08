const request = require("supertest");
const express = require("express");
const router = require("../../src/Auth/get/getUserData"); // Update path as needed
const userModel = require("../../src/Model/user");

// Mock auth middleware
jest.mock("../../src/middleware/authCheck", () => (req, res, next) => {
  req.headers.uid = "user123"; // Simulate logged-in user
  next();
});

// Mock user model
jest.mock("../../src/Model/user");

const app = express();
app.use(express.json());
app.use("/", router);

describe("GET /get - Get User Data", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return user data successfully", async () => {
    const mockUser = {
      _id: "user123",
      Name: "John Doe",
      phoneNo: "1234567890",
      Gender: "Male",
      accountType: "Patient"
    };

    userModel.findById.mockResolvedValue(mockUser);

    const res = await request(app).get("/get");

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject(mockUser);
    expect(userModel.findById).toHaveBeenCalledWith({ _id: "user123" });
  });

  it("should return 400 on DB error", async () => {
    userModel.findById.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/get");

    expect(res.statusCode).toBe(400);
    expect(res.text).toBe("an error Occurred :(");
  });
});