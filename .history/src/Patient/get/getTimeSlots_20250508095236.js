const express = require("express");
const router = express.Router();
const weekModel = require("../../Model/weeklySchedule");
const appointmentModel = require("../../Model/appointments");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");

dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

router.post("/", async (req, res) => {
  try {
    const { uid, date } = req.body;

    if (!uid || !date) {
      return res.status(400).send({ error: "Missing uid or date in headers" });
    }

    const weekData = await weekModel.findOne({ uid });
    if (!weekData) {
      return res.status(404).send({ error: "Doctor's schedule not found" });
    }

    const requestedDate = dayjs(date, "YYYY-MM-DD");
    const dayName = requestedDate.format("dddd");

    if (!weekData[dayName]) {
      return res.status(200).send({
        available: false,
        message: `Doctor not available on ${dayName}`,
        availableSlots: [],
      });
    }

    const start = dayjs(`${date} ${weekData.workingHourFrom}`, "YYYY-MM-DD HH:mm");
    const end = dayjs(`${date} ${weekData.workingHourTo}`, "YYYY-MM-DD HH:mm");

    if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
      return res.status(500).send({ error: "Invalid working hours in schedule" });
    }

    const timeSlots = [];
    let current = start;

    while (current.isBefore(end)) {
      timeSlots.push(current.format("HH:mm"));
      current = current.add(30, "minute");
    }

    const appointments = await appointmentModel.find({
      uidDoc: uid,
      Apt: {
        $gte: new Date(`${date}T00:00:00Z`),
        $lt: new Date(`${date}T23:59:59Z`),
      },
    });

    const bookedTimes = appointments.map((apt) => dayjs(apt.Apt).utc());

    const filteredSlots = timeSlots.filter((slot) => {
      const slotTime = dayjs(`${date} ${slot}`, "YYYY-MM-DD HH:mm").utc();
      if (!slotTime.isValid()) return false;

      return !bookedTimes.some((bookedTime) => {
        if (!bookedTime.isValid()) return false;
        return Math.abs(bookedTime.diff(slotTime, "minute")) < 30;
      });
    });

    return res.status(200).send({
      available: true,
      day: dayName,
      workingHourFrom: weekData.workingHourFrom,
      workingHourTo: weekData.workingHourTo,
      availableSlots: filteredSlots,
    });
  } catch (e) {
    console.error("Error fetching availability:", e);
    return res.status(500).send({ error: "Internal server error" });
  }
});

module.exports = router;