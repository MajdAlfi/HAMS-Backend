const express = require("express");
const router = express.Router();
const weekModel = require("../../Model/weeklySchedule");
const appointmentModel = require("../../Model/appointments");
const dayjs = require("dayjs"); // Install with npm if needed
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
  
    // Get weekly availability for the doctor
    const weekData = await weekModel.findOne({ uid });
    if (!weekData) {
      return res.status(404).send({ error: "Doctor's schedule not found" });
    }

    const requestedDate = dayjs(date, "YYYY-MM-DD");
    const dayName = requestedDate.format("dddd"); // e.g., "Tuesday"
  
    if (!weekData[dayName]) {
      console.log(dayName)
      return res.status(200).send({
        available: false,
        message: `Doctor not available on ${dayName}`,
        availableSlots: [],
      });
    }
    
    // Parse working hours
    const start = dayjs(`${date} ${weekData.workingHourFrom}`, "YYYY-MM-DD HH:mm");
    const end = dayjs(`${date} ${weekData.workingHourTo}`, "YYYY-MM-DD HH:mm");
    

    if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
      return res.status(500).send({ error: "Invalid working hours in schedule" });
    }

    // Generate 30-minute interval slots
    const timeSlots = [];
    let current = start;

    while (current.add(30, "minute").isSameOrBefore(end)) {
      timeSlots.push(current.format("HH:mm"));
      current = current.add(30, "minute");
    }

    // Get existing appointments for the doctor on that date
    const appointments = await appointmentModel.find({
      uidDoc: uid,
      Apt: {
        $gte: new Date(`${date}T00:00:00Z`),
        $lt: new Date(`${date}T23:59:59Z`),
      },
    });

    const bookedTimes = appointments.map((apt) =>
      dayjs(apt.Apt).format("HH:mm")
    ).utc();

    // Filter out slots within 30 minutes of a booked appointment
    const filteredSlots = timeSlots.filter((slot) => {
      const slotTime = dayjs(`${date} ${slot}`, "YYYY-MM-DD HH:mm");

      return !bookedTimes.some((booked) => {
        const bookedTime = dayjs(`${date} ${booked}`, "YYYY-MM-DD HH:mm");
        return Math.abs(bookedTime.diff(slotTime, "minute")) < 30;
      });
    });

    res.status(200).send({
      available: true,
      day: dayName,
      workingHourFrom: weekData.workingHourFrom,
      workingHourTo: weekData.workingHourTo,
      availableSlots: filteredSlots,
    });
  } catch (e) {
    console.error("Error fetching availability:", e);
    res.status(500).send({ error: "Internal server error" });
  }
});

module.exports = router;
