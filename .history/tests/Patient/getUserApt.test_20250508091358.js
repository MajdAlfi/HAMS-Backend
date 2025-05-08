const express = require("express");
const router = express.Router();
const aptModel = require("../../Model/appointments");
const docModel = require("../../Model/doctor");

router.get("/", async (req, res) => {
  const { uid } = req.headers;

  if (!uid) return res.status(400).send("Missing uid in headers");

  try {
    const appointments = await aptModel.find({ uidPatient: uid }).sort({ Apt: 1 });

    const rawAppointments = appointments.map((apt) => apt.toObject());
    const doctorUIDs = [...new Set(rawAppointments.map((apt) => apt.uidDoc))];
    const doctors = await docModel.find({ uid: { $in: doctorUIDs } });

    const doctorMap = {};
    doctors.forEach((doc) => {
      doctorMap[doc.uid] = doc.name;
    });

    const enrichedAppointments = rawAppointments.map((apt) => ({
      ...apt,
      doctorName: doctorMap[apt.uidDoc] || "Unknown Doctor",
    }));

    res.status(200).json(enrichedAppointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;