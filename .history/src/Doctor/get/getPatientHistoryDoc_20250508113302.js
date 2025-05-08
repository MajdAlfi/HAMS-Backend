const express = require("express");
const router = express.Router();
const aptModel = require("../../Model/appointments");
const docModel = require("../../Model/doctor");

router.get("/", async (req, res) => {
  try {
    const { uid } = req.headers;
    if (!uid) return res.status(400).send("Missing user ID in headers.");

    const appointments = await aptModel.find({ uidPatient: uid }).sort({ Apt: -1 });
    const docUids = [...new Set(appointments.map((apt) => apt.uidDoc))];
    const doctors = await docModel.find({ uid: { $in: docUids } });

    const doctorMap = {};
    doctors.forEach((doc) => {
      doctorMap[doc.uid] = { name: doc.name, img: doc.img };
    });

    const enrichedHistory = appointments.map((apt) => ({
      ...apt.toObject(),
      doctor: doctorMap[apt.uidDoc] || { name: "Unknown Doctor", img: "" },
    }));

    res.status(200).json({ history: enrichedHistory });
  } catch (err) {
    console.error("Error fetching patient history:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;