const express = require("express");
const router = express.Router();
const WeeklySchedule = require("../../Model/weeklySchedule");
const SpecialOccations = require("../../Model/specialOccations");
const auth = require("../../middleware/authCheck");

// GET weekly schedule + special occasions
router.get("/", async (req, res) => {
  const { uid } = req.headers;
  if (!uid) return res.status(400).send("Missing uid");

  try {
    const weekly = await WeeklySchedule.findOne({ uid });
    const specials = await SpecialOccations.find({ uid });

    if (!weekly) {
      return res.status(404).json({ message: "No schedule found" });
    }

    return res.status(200).json({
      weekly,
      specials,
    });
  } catch (err) {
    console.error("Error fetching schedule:", err);
    return res.status(500).send("Internal server error");
  }
});

// POST save or update weekly availability
router.post("/saveWeeklyAvailability", auth, async (req, res) => {
  const { uid } = req.headers;
  const {
    Sunday,
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
    workingHourFrom,
    workingHourTo,
  } = req.body;

  if (!uid) return res.status(400).send("Missing uid");

  try {
    const existing = await WeeklySchedule.findOne({ uid });

    if (existing) {
      existing.set({
        Sunday,
        Monday,
        Tuesday,
        Wednesday,
        Thursday,
        Friday,
        Saturday,
        workingHourFrom,
        workingHourTo,
      });
      await existing.save();
    } else {
      await WeeklySchedule.create({
        uid,
        Sunday,
        Monday,
        Tuesday,
        Wednesday,
        Thursday,
        Friday,
        Saturday,
        workingHourFrom,
        workingHourTo,
      });
    }

    return res.status(200).send("Weekly availability saved");
  } catch (err) {
    console.error("Error saving weekly availability:", err);
    return res.status(500).send("Internal server error");
  }
});

// POST add special occasion
router.post("/saveSpecialOccasion", auth, async (req, res) => {
  const { uid } = req.headers;
  const { From, To } = req.body;

  if (!uid || !From || !To) {
    return res.status(400).send("Missing uid or dates");
  }

  try {
    await SpecialOccations.create({ uid, From, To });
    return res.status(200).send("Special occasion saved");
  } catch (err) {
    console.error("Error saving special occasion:", err);
    return res.status(500).send("Internal server error");
  }
});

// DELETE special occasion by ID
router.delete("/deleteSpecialOccasion", auth, async (req, res) => {
  const { uid } = req.headers;
  const { id } = req.body;

  if (!uid || !id) {
    return res.status(400).send("Missing uid or id");
  }

  try {
    const deleted = await SpecialOccations.findOneAndDelete({ _id: id, uid });

    if (!deleted) {
      return res.status(404).send("Special occasion not found");
    }

    return res.status(200).send("Special occasion deleted");
  } catch (err) {
    console.error("Error deleting special occasion:", err);
    return res.status(500).send("Internal server error");
  }
});

module.exports = router;