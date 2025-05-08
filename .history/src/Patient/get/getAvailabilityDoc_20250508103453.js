const express = require('express');
const router = express.Router();
const weekModel = require('../../Model/weeklySchedule');

router.get('/', async (req, res) => {
  try {
    const { uid } = req.headers;
    if (!uid) return res.status(400).send('Missing uid');

    const data = await weekModel.find({ uid });
    res.status(200).send({ dataWeek: data });
  } catch (err) {
    console.error('Error fetching availability:', err);
    res.status(400).send(err.message || 'Error fetching schedule');
  }
});

module.exports = router;