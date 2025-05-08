const express = require('express')
const router = express.Router()
const auth = require('../../middleware/authCheck')
const aptModel = require("../../Model/appointments")

router.post('/', auth, async (req, res) => {
    try {
      const { uid } = req.headers;
      const { aptDate, uidDoc, desc, HName } = req.body;
  
      await aptModel.create({
        Apt: aptDate,
        uidDoc,
        uidPatient: uid,
        Hospital: HName,
        State: 'Confirmed',
        descPatient: desc,
        diagnosis: '',
      });
  
      return res.status(200).send('Done');
    } catch (e) {
      return res.status(400).send(e.message || 'Error');
    }


})
module.exports = router