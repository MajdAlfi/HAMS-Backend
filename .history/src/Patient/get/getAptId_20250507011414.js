const express = require("express");
const router = express.Router();
const aptModel = require("../../Model/appointments");
const doctorModel = require("../../Model/doctor"); // Make sure the path matches your file structure

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the appointment by ID
    const appointment = await aptModel.findById(id);
    if (!appointment) {
      return res.status(404).send("Appointment not found");
    }

    // 2. Find the doctor using uidDoc
    const doctor = await doctorModel.findOne({ uid: appointment.uidDoc });
    const doctorName = doctor ? doctor.name : "Unknown Doctor";

    // 3. Combine and return
    return res.status(200).json({
      ...appointment.toObject(),
      doctorName,
    });
  } catch (error) {
    console.error("Failed to get appointment:", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
