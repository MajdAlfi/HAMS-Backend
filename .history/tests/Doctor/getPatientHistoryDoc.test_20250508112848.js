const request = require("supertest");
const express = require("express");
const router = require("../../src/Doctor/get/getPatientHistoryDoc");
const aptModel = require("../../src/Model/appointments");
const docModel = require("../../src/Model/doctor");

// Mocks
jest.mock("../../src/Model/appointments");
jest.mock("../../src/Model/doctor");

const app = express();
app.use(express.json());
app.use("/", router);

describe("GET /getAptPatientDoc - Get Patient Appointment History with Doctor Info", () => {
  const headers = { patientuid: "patient123" };

  beforeEach(() => {
    jest.clearAllMocks();
  
    aptModel.find.mockResolvedValue([
      {
        toObject: () => ({
          uidDoc: "doc1",
          uidPatient: "patient123",
          Apt: new Date(),
        }),
      },
      {
        toObject: () => ({
          uidDoc: "doc2",
          uidPatient: "patient123",
          Apt: new Date(),
        }),
      },
    ]);
  
    docModel.find.mockResolvedValue([
      { uid: "doc1", name: "Dr. Smith", img: "img1.jpg" },
      { uid: "doc2", name: "Dr. Jane", img: "img2.jpg" },
    ]);
  });

  it("should return 200 and enriched appointment history", async () => {
    aptModel.find.mockResolvedValue([
      {
        toObject: () => ({ uidDoc: "doc1", uidPatient: "patient123", Apt: new Date() }),
      },
      {
        toObject: () => ({ uidDoc: "doc2", uidPatient: "patient123", Apt: new Date() }),
      },
    ]);

    docModel.find.mockResolvedValue([
      { uid: "doc1", name: "Dr. Smith", img: "img1.jpg" },
      { uid: "doc2", name: "Dr. Jane", img: "img2.jpg" },
    ]);

    const res = await request(app).get("/").set(headers);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.history)).toBe(true);
    expect(res.body.history.length).toBe(2);
    expect(res.body.history[0].doctor).toHaveProperty("name");
    expect(res.body.history[0].doctor).toHaveProperty("img");
  });

  it("should return 400 if patientuid is missing", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(400);
    expect(res.text).toContain("Missing user ID in headers.");
  });

  it("should handle missing doctor data gracefully", async () => {
    aptModel.find.mockResolvedValue([
      {
        toObject: () => ({ uidDoc: "docX", uidPatient: "patient123", Apt: new Date() }),
      },
    ]);
    docModel.find.mockResolvedValue([]); // No doctors found

    const res = await request(app).get("/").set(headers);
    expect(res.statusCode).toBe(200);
    expect(res.body.history[0].doctor.name).toBe("Unknown Doctor");
  });

  it("should return 500 on DB error", async () => {
    aptModel.find.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/").set(headers);
    expect(res.statusCode).toBe(500);
    expect(res.text).toBe("Internal Server Error");
  });
});