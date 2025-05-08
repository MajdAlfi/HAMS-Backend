const express = require('express');
const router = express.Router();
const aptModel = require('../../Model/appointments');
const docModel = require('../../Model/doctor');
const auth = require('../../middleware/authCheck');

router.get('/', auth, async (req, res) => {
  try {
    const { id: uid } = req.user || {};
    if (!uid) return res.status(400).send("Missing user ID");

    const docList = [];
    const aptHistory = await aptModel.find({ uidPatient: uid }).sort({ Apt: -1 });

    for (const apt of aptHistory) {
      const doc = await docModel.findOne({ uid: apt.uidDoc });
      docList.push({
        name: doc?.name || "Unknown",
        img: doc?.img || ""
      });
    }

    const result = { listNames: docList, listAptHistory: aptHistory };
    res.status(200).send(result);
  } catch (e) {
    res.status(400).send("An Error occurred");
  }
});

module.exports = router;