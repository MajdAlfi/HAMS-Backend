const request = require("supertest");
const express = require("express");
const router = require("../../src/Doctor/get/getDocAva");
const weeklyModel = require("../../src/Model/weeklySchedule");
const specialModel = require("../../src/Model/specialOccations");

// Mock the DB models
jest.mock("../../src/Model/weeklySchedule");
jest.mock("../../src/Model/specialOccations");

// Set up Express app
const app = express();
app.use(express.json());
app.use("/", router);

describe("GET /getAvailability", () => {
  const headers = { uid: "doc123" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 and weekly/special availability", async () => {
    const mockWeekly = { uid: "doc123", Monday: true };
    const mockSpecials = [{ uid: "doc123", From: "2025-08-01", To: "2025-08-02" }];

    weeklyModel.findOne.mockResolvedValue(mockWeekly);
    specialModel.find.mockResolvedValue(mockSpecials);

    const res = await request(app).get("/").set(headers);

    expect(res.statusCode).toBe(200);
    expect(res.body.weekly).toEqual(mockWeekly);
    expect(res.body.specials).toEqual(mockSpecials);
  });

  it("should return 400 if uid is missing", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain("Missing uid");
  });

  it("should return 404 if weekly schedule is not found", async () => {
    weeklyModel.findOne.mockResolvedValue(null);
    specialModel.find.mockResolvedValue([]);

    const res = await request(app).get("/").set(headers);
    expect(res.statusCode).toBe(404);
    expect(res.text).toContain("No weekly availability");
  });

  it("should return 500 on DB error", async () => {
    weeklyModel.findOne.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/").set(headers);
    expect(res.statusCode).toBe(500);
    expect(res.text).toContain("Internal server error");
  });
});