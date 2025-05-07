const express = require("express");
const router = express.Router();
const aptModel = require("../../Model/appointments");
const userModel = require("../../Model/user");
const auth = require("../../middleware/authCheck");

router.patch("/:aptId", auth, async (req, res) => {
  const { aptId } = req.params;
  const { diagnosis } = req.body;
  const { uid } = req.headers;

  if (!diagnosis || diagnosis.trim().length === 0) {
    return res.status(400).send("Diagnosis is required.");
  }

  try {
    const doctor = await userModel.findById(uid);
    if (!doctor || doctor.accountType !== "Doctor") {
      return res.status(403).send("Only doctors are allowed to update diagnosis.");
    }

    const updated = await aptModel.findByIdAndUpdate(
      aptId,
      { diagnosis },
      { new: true }
    );

    if (!updated) {
      return res.status(404).send("Appointment not found.");
    }

    res.status(200).send("Diagnosis updated successfully.");
  } catch (err) {
    console.error("Error updating diagnosis:", err);
    res.status(500).send("Server error.");
  }
});

module.exports = router;