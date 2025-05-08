const express = require("express");
const router = express.Router();
const aptModel = require("../../Model/appointments");
const docModel = require("../../Model/doctor");

router.get("/", async (req, res) => {
  try {
    const { patientuid } = req.headers;

    if (!patientuid) {
      return res.status(400).send("Missing user ID in headers.");
    }

    // Fetch appointments for the patient
    const appointments = await aptModel.find({ uidPatient: patientuid }).sort({ Apt: -1 });

    // Convert appointments to plain objects
    const plainAppointments = appointments.map((apt) =>
      typeof apt.toObject === "function" ? apt.toObject() : apt
    );

    // Get all unique doctor UIDs
    const docUids = [...new Set(plainAppointments.map((apt) => apt.uidDoc))];
    const doctors = await docModel.find({ uid: { $in: docUids } });

    // Build map of UID to doctor info
    const doctorMap = {};
    doctors.forEach((doc) => {
      doctorMap[doc.uid] = { name: doc.name, img: doc.img };
    });

    // Enrich appointment history with doctor info
    const enrichedHistory = plainAppointments.map((apt) => ({
      ...apt,
      doctor: doctorMap[apt.uidDoc] || { name: "Unknown Doctor", img: "" },
    }));

    return res.status(200).json({ history: enrichedHistory });
  } catch (err) {
    console.error("Error fetching patient history:", err);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = router;