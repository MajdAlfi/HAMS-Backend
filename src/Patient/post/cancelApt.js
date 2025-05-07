const express = require("express");
const router = express.Router();
const aptModel = require("../../Model/appointments");
const authMiddleware = require("../../middleware/authCheck");

// Cancel appointment
router.delete("/:id", authMiddleware, async (req, res) => {
  const appointmentId = req.params.id;
  const userId = req.user.id; // from decoded JWT
  const {uid} = Headers;

  try {
    const appointment = await aptModel.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Ensure the user owns the appointment
    if (uid !== userId) {
      return res.status(403).json({ message: "Unauthorized to cancel this appointment" });
    }

    await aptModel.findByIdAndDelete(appointmentId);

    res.status(200).json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;