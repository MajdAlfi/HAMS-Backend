const express = require("express");
const router = express.Router();
const auth = require("../../middleware/authCheck");
const aptModel = require("../../Model/appointments");
const specialModel = require("../../Model/specialOccations");
const weeklyModel = require("../../Model/weeklySchedule");

const dayjs = require("dayjs");

router.post("/", auth, async (req, res) => {
  try {
    const { uid } = req.headers;
    const { aptDate, uidDoc, desc, HName } = req.body;

    if (!aptDate || !uidDoc || !desc || !HName) {
      return res.status(400).send("Missing required fields.");
    }

    const appointmentDate = new Date(aptDate);
    const appointmentDayOnly = new Date(appointmentDate);
    appointmentDayOnly.setHours(0, 0, 0, 0);

    // ✅ Step 1: Check weekday availability
    const weekdayName = dayjs(appointmentDate).format("dddd"); // e.g. "Wednesday"
    const weekly = await weeklyModel.findOne({ uid: uidDoc });

    if (!weekly || !weekly[weekdayName]) {
      return res
        .status(409)
        .send(`Doctor is not available on ${weekdayName}, please select another day.`);
    }

    // ✅ Step 2: Check special occasion conflict
    const conflictingOccasion = await specialModel.findOne({
      uid: uidDoc,
      From: { $lte: appointmentDayOnly },
      To: { $gte: appointmentDayOnly },
    });

    if (conflictingOccasion) {
      return res
        .status(409)
        .send("Doctor is unavailable on this date due to a special occasion.");
    }

    // ✅ Step 3: Double booking checks
    const doctorBusy = await aptModel.findOne({ uidDoc, Apt: appointmentDate });
    if (doctorBusy) return res.status(409).send("Doctor already has an appointment at this time.");

    const patientBusy = await aptModel.findOne({ uidPatient: uid, Apt: appointmentDate });
    if (patientBusy) return res.status(409).send("You already have an appointment at this time.");

    // ✅ Step 4: Create appointment
    await aptModel.create({
      Apt: appointmentDate,
      uidDoc,
      uidPatient: uid,
      Hospital: HName,
      State: "Confirmed",
      descPatient: desc,
      diagnosis: " ",
    });

    return res.status(200).send("Appointment created successfully.");
  } catch (e) {
    console.error("Error booking appointment:", e);
    return res.status(500).send("Internal server error."+e);
  }
});

module.exports = router;