const express = require("express");
const router = express.Router();
const aptModel = require("../../Model/appointments");
const specialModel = require("../../Model/specialOccations");
const weekModel = require("../../Model/weeklySchedule");
const doctorModel = require("../../Model/doctor"); // Make sure this model exists

const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

// Generate 30-minute slots
function generateTimeSlots(startStr, endStr, baseDate) {
  const format = startStr.includes("AM") || startStr.includes("PM") ? "h:mm A" : "HH:mm";
  const start = dayjs(`${baseDate} ${startStr}`, `YYYY-MM-DD ${format}`);
  const end = dayjs(`${baseDate} ${endStr}`, `YYYY-MM-DD ${format}`);

  if (!start.isValid() || !end.isValid()) {
    console.log("⛔ Invalid time range:", startStr, endStr);
    return [];
  }

  const slots = [];
  let current = start;

  while (current.isBefore(end)) {
    slots.push(current.toDate());
    current = current.add(30, "minute");
  }

  return slots;
}

router.get("/", async (req, res) => {
  try {
    const { uid } = req.headers;
    if (!uid) return res.status(400).send("Missing uidPatient in headers");

    const doctors = await weekModel.aggregate([{ $sample: { size: 12 } }]);
    const suggestions = [];

    for (let doc of doctors) {
      const doctorId = doc.uid;
      const doctorInfo = await doctorModel.findOne({ uid: doctorId });
      if (!doctorInfo) continue;

      const week = {
        Sunday: doc.Sunday,
        Monday: doc.Monday,
        Tuesday: doc.Tuesday,
        Wednesday: doc.Wednesday,
        Thursday: doc.Thursday,
        Friday: doc.Friday,
        Saturday: doc.Saturday,
      };

      const from = doc.workingHourFrom;
      const to = doc.workingHourTo;

      for (let i = 0; i < 14; i++) {
        const date = dayjs().add(i, "day");
        const dayName = date.format("dddd");
        if (!week[dayName]) continue;

        const special = await specialModel.findOne({
          uid: doctorId,
          From: { $lte: date.toDate() },
          To: { $gte: date.toDate() },
        });
        if (special) continue;

        const slots = generateTimeSlots(from, to, date.format("YYYY-MM-DD"));

        for (let slot of slots) {
          if (dayjs(slot).isBefore(dayjs())) continue;

          const doctorBusy = await aptModel.findOne({ uidDoc: doctorId, Apt: slot });
          const patientBusy = await aptModel.findOne({ uidPatient: uid, Apt: slot });

          if (!doctorBusy && !patientBusy) {
            suggestions.push({
              doctorId,
              doctorName: doctorInfo.name,
              Hospital:doctorInfo.Hospital,
              desc: doctorInfo.desc,
              date: date.format("YYYY-MM-DD"),
              time: dayjs(slot).format("HH:mm"),
            });
          }

          if (suggestions.length >= 5) break;
        }

        if (suggestions.length >= 5) break;
      }

      if (suggestions.length >= 5) break;
    }

    if (suggestions.length === 0) {
      return res.status(404).send("No appointment suggestions available.");
    }

    return res.status(200).json(suggestions);
  } catch (err) {
    console.error("Error generating appointment suggestions:", err);
    return res.status(500).send("Internal server error.");
  }
});

module.exports = router;
