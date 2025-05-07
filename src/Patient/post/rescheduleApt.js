const express = require("express");
const router = express.Router();
const aptModel = require("../../Model/appointments");
const scheduleModel = require("../../Model/weeklySchedule");
const specialModel = require("../../Model/specialOccations");
const authMiddleware = require("../../middleware/authCheck");

const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const isSameOrAfter = require("dayjs/plugin/isSameOrAfter");

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);

function isWithinWorkingHours(dateTime, fromStr, toStr) {
  const dateStr = dayjs(dateTime).format("YYYY-MM-DD");


  const format = fromStr.toLowerCase().includes("am") || fromStr.toLowerCase().includes("pm")
    ? "h:mm A"
    : "HH:mm";

  const start = dayjs(`${dateStr} ${fromStr}`, `YYYY-MM-DD ${format}`);
  const end = dayjs(`${dateStr} ${toStr}`, `YYYY-MM-DD ${format}`);

  const current = dayjs(dateTime);

  return current.isSameOrAfter(start) && current.isBefore(end);
}

// PATCH /rescheduleAppointment/:id
router.patch("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { newDate } = req.body;
  const { uid } = req.headers;

  if (!newDate) {
    return res.status(400).send("Missing new appointment date.");
  }

  try {
    const appointment = await aptModel.findById(id);
    if (!appointment) {
      return res.status(404).send("Appointment not found.");
    }

    if (appointment.uidPatient !== uid) {
      return res.status(403).send("Not authorized to modify this appointment.");
    }

    const doctorId = appointment.uidDoc;
    const dateObj = dayjs(newDate);
    const dayName = dateObj.format("dddd");

    const weeklySchedule = await scheduleModel.findOne({ uid: doctorId });
    if (!weeklySchedule || !weeklySchedule[dayName]) {
      return res.status(409).send("Doctor is not available on this day.");
    }

    const isOnLeave = await specialModel.findOne({
      uid: doctorId,
      From: { $lte: dateObj.toDate() },
      To: { $gte: dateObj.toDate() },
    });
    if (isOnLeave) {
      return res.status(409).send("Doctor is on leave that day.");
    }

    const { workingHourFrom, workingHourTo } = weeklySchedule;
    if (!isWithinWorkingHours(newDate, workingHourFrom, workingHourTo)) {
      return res.status(409).send("Appointment time is outside of working hours.");
    }

    const newStart = dayjs(newDate);
    const newEnd = newStart.add(30, "minute");

    const doctorConflict = await aptModel.findOne({
      uidDoc: doctorId,
      _id: { $ne: id },
      Apt: { $gte: newStart.toDate(), $lt: newEnd.toDate() },
    });
    if (doctorConflict) {
      return res.status(409).send("Doctor already has another appointment at that time.");
    }

    const patientConflict = await aptModel.findOne({
      uidPatient: uid,
      _id: { $ne: id },
      Apt: { $gte: newStart.toDate(), $lt: newEnd.toDate() },
    });
    if (patientConflict) {
      return res.status(409).send("You already have another appointment at that time.");
    }

    appointment.Apt = new Date(newDate);
    await appointment.save();

    res.status(200).send("Appointment rescheduled successfully.");
  } catch (error) {
    console.error("Rescheduling error:", error);
    res.status(500).send("Internal server error. " + error);
  }
});

module.exports = router;