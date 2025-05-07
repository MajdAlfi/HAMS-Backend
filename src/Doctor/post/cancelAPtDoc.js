const express = require("express");
const router = express.Router();
const aptModel = require("../../Model/appointments");


router.patch("/:aptId", async (req, res) => {
  const { aptId } = req.params;
  const { uid } = req.headers; // doctor's UID
  console.log("Received cancel request:", { aptId, uid });
  if (!uid) {
    return res.status(400).send("Doctor UID missing in headers.");
  }

  try {
    const appointment = await aptModel.findById(aptId);

    if (!appointment) {
      return res.status(404).send("Appointment not found.");
    }

    if (appointment.uidDoc !== uid) {
      return res.status(403).send("Not authorized to cancel this appointment.");
    }

    if (appointment.State === "Cancelled") {
      return res.status(409).send("Appointment already cancelled.");
    }

    appointment.State = "Cancelled";
    await appointment.save();

    res.status(200).send("Appointment cancelled successfully.");
  } catch (err) {
    console.error("Error cancelling appointment:", err);
    res.status(500).send("Internal server error.");
  }
});

module.exports = router;