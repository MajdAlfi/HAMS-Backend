const express = require("express");
const router = express.Router();
const weeklyModel = require("../../Model/weeklySchedule");
const specialModel = require("../../Model/specialOccations");

// Route: GET /getAvailability
router.get("/", async (req, res) => {
  const { uid } = req.headers;

  if (!uid) {
    return res.status(400).send("Missing uid in headers");
  }

  try {
    const weekly = await weeklyModel.findOne({ uid });
    const specials = await specialModel.find({ uid });

    if (!weekly) {
      return res.status(404).send("No weekly availability found for this doctor");
    }

    return res.status(200).json({
      weekly,
      specials,
    });
  } catch (err) {
    console.error("Error fetching availability:", err);
    return res.status(500).send("Internal server error");
  }
});

module.exports = router;
