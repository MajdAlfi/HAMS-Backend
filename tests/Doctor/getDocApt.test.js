const request = require("supertest");
const express = require("express");
const router = require("../../src/Doctor/get/getDocApt");
const aptModel = require("../../src/Model/appointments");
const userModel = require("../../src/Model/user");

jest.mock("../../src/Model/appointments");
jest.mock("../../src/Model/user");

const app = express();
app.use(express.json());
app.use("/", router);

describe("GET / - Get Doctor Appointments By Date", () => {
  const headers = { uid: "doc123" };
  const query = { date: "2025-07-10" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 and enriched appointment data", async () => {
    aptModel.find.mockResolvedValue([
        {
          toObject: () => ({
            _id: "apt1",
            uidDoc: "doc123",
            uidPatient: "pat1",  // 👈 Ensure this matches _id as string
            Apt: new Date("2025-07-10T10:00:00.000Z"),
          }),
        },
      ]);

    userModel.find.mockResolvedValue([{ _id: "pat1", Name: "Alice" }]);

    const res = await request(app).get("/").set(headers).query(query);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].patientName).toBe("Alice");
  });

  it("should return 400 if uid or date is missing", async () => {
    const res = await request(app).get("/").query({}); // no uid or date
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Missing uid or date");
  });

  it("should fallback to 'Unknown' if patient not found", async () => {
    aptModel.find.mockResolvedValue([
      {
        toObject: () => ({
          _id: "apt1",
          uidDoc: "doc123",
          uidPatient: "patX",
          Apt: new Date("2025-07-10T10:00:00.000Z"),
        }),
      },
    ]);

    userModel.find.mockResolvedValue([]); // no matching patient

    const res = await request(app).get("/").set(headers).query(query);
    expect(res.statusCode).toBe(200);
    expect(res.body[0].patientName).toBe("Unknown");
  });

  it("should return 500 on DB error", async () => {
    aptModel.find.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/").set(headers).query(query);
    expect(res.statusCode).toBe(500);
    expect(res.text).toContain("Internal server error");
  });
});