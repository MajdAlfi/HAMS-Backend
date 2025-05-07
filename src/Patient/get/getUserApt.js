const express = require("express");
const router = express.Router();
const aptModel = require("../../Model/appointments");
const docModel = require("../../Model/doctor"); // adjust the path if needed

router.get("/", async (req, res) => {
  const { uid } = req.headers;

  if (!uid) {
    return res.status(400).send("Missing uid in headers");
  }

  try {
    // Fetch all appointments for the patient
    const appointments = await aptModel.find({ uidPatient: uid }).sort({ Apt: 1 });

    // Fetch all doctor data once
    const doctorUIDs = [...new Set(appointments.map((apt) => apt.uidDoc))];
    const doctors = await docModel.find({ uid: { $in: doctorUIDs } });

    // Create a map of uid → doctor name
    const doctorMap = {};
    doctors.forEach((doc) => {
      doctorMap[doc.uid] = doc.name;
    });

    // Append doctorName to each appointment
    const enrichedAppointments = appointments.map((apt) => ({
      ...apt.toObject(),
      doctorName: doctorMap[apt.uidDoc] || "Unknown Doctor",
    }));

    res.status(200).json(enrichedAppointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;