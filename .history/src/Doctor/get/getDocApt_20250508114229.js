const express = require("express");
const router = express.Router();
const aptModel = require("../../Model/appointments");
const userModel = require("../../Model/user");

router.get("/", async (req, res) => {
  const { uid } = req.headers;
  const { date } = req.query;

  if (!uid || !date) {
    return res.status(400).json({ error: "Missing uid or date" });
  }

  try {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await aptModel.find({
      uidDoc: uid,
      Apt: { $gte: startOfDay, $lte: endOfDay },
    });

    const patientIds = appointments.map((apt) => apt.uidPatient);
    const patients = await userModel.find({ _id: { $in: patientIds } });

    const patientMap = {};
    patients.forEach((p) => {
      const patientMap = {};
patients.forEach((p) => {
  patientMap[p._id.toString()] = p.Name;
});

const enriched = appointments.map((apt) => ({
  ...apt.toObject(),
  patientName: patientMap[apt.uidPatient.toString()] || "Unknown",  // 🔧 add `.toString()` here
}));
    });

    const enriched = appointments.map((apt) => ({
      ...apt.toObject(),
      patientName: patientMap[apt.uidPatient] || "Unknown",
    }));

    return res.json(enriched);
  } catch (err) {
    console.error("Error fetching doctor appointments:", err);
    return res.status(500).send("Internal server error");
  }
});

module.exports = router;