const request = require("supertest");
const express = require("express");
const router = require("../../src/Doctor/get/getDocData"); // adjust path if needed
const docModel = require("../../src/Model/doctor");

// Mock the auth middleware to inject a valid UID
jest.mock("../../src/middleware/authCheck", () => (req, res, next) => {
  req.headers.uid = "doc123";
  next();
});

// Mock the doctor model
jest.mock("../../src/Model/doctor");

const app = express();
app.use(express.json());
app.use("/", router);

describe("GET /getDoc", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return doctor data successfully", async () => {
    const mockDoctor = {
      uid: "doc123",
      name: "Dr. John Doe",
      desc: "Cardiologist",
      img: "doctor.jpg",
      Hospital: "City Hospital"
    };

    docModel.find.mockResolvedValue([mockDoctor]);

    const res = await request(app).get("/getDoc");

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject(mockDoctor);
    expect(docModel.find).toHaveBeenCalledWith({ uid: "doc123" });
  });

  it("should return 400 on error", async () => {
    docModel.find.mockRejectedValue(new Error("DB Error"));

    const res = await request(app).get("/getDoc");

    expect(res.statusCode).toBe(400);
    expect(res.text).toBe("an error Occurred :(");
  });
});