const request = require("supertest");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const loginRouter = require("../../src/Auth/post/login");
const userModel = require("../../src/Model/user");

jest.mock("../../src/Model/user");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

const app = express();
app.use(express.json());
app.use("/login", loginRouter);

describe("POST /login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if phoneNo or password is missing", async () => {
    const res = await request(app).post("/login").send({});
    expect(res.statusCode).toBe(400);
    expect(res.text).toBe("Please enter a Phone Number and a password");
  });

  it("should return 404 if user does not exist", async () => {
    userModel.findOne.mockResolvedValue(null);

    const res = await request(app).post("/login").send({
      phoneNo: "1234567890",
      password: "password",
    });

    expect(res.statusCode).toBe(404);
    expect(res.text).toBe("Phone Number does not exist");
  });

  it("should return 200 and token if credentials are valid", async () => {
    const mockUser = {
      _id: "user123",
      phoneNo: "1234567890",
      password: "hashedpass",
      accountType: "Patient",
    };

    userModel.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("mock.jwt.token");

    const res = await request(app).post("/login").send({
      phoneNo: "1234567890",
      password: "password",
    });

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("mock.jwt.token");
  });

  it("should return 400 if password is invalid", async () => {
    const mockUser = {
      _id: "user123",
      phoneNo: "1234567890",
      password: "hashedpass",
    };

    userModel.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app).post("/login").send({
      phoneNo: "1234567890",
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(400);
    expect(res.text).toBe("Invalid Credentials");
  });

  it("should return 400 if internal error occurs", async () => {
    userModel.findOne.mockRejectedValue(new Error("DB error"));

    const res = await request(app).post("/login").send({
      phoneNo: "1234567890",
      password: "password",
    });

    expect(res.statusCode).toBe(400);
    expect(res.text).toBe("err");
  });
});