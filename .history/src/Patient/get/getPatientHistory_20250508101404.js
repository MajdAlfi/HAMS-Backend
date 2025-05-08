const express = require('express');
const router = express.Router();
const aptModel = require('../../Model/appointments');
const docModel = require('../../Model/doctor');
const auth = require('../../middleware/authCheck');

router.get('/', auth, async (req, res) => {
  try {
    const uid = req.user?.id;
    if (!uid) return res.status(400).send("Missing user ID in headers");

    const aptHistory = await aptModel.find({ uidPatient: uid }).sort({ Apt: -1 });
    const listNames = [];

    for (const apt of aptHistory) {
      const doc = await docModel.findOne({ uid: apt.uidDoc });
      listNames.push({ name: doc?.name || "Unknown", img: doc?.img || "" });
    }

    res.status(200).send({ listNames, listAptHistory: aptHistory });
  } catch (e) {
    res.status(400).send("An Error occurred");
  }
});

module.exports = router;