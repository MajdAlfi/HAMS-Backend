const fs = require("fs");
const path = require("path");
const express = require("express");
const router = express.Router();

router.get("/all-doc-images", (req, res) => {
  const imagesDir = path.join(__dirname, "../../assets/docIMGs");

  fs.readdir(imagesDir, (err, files) => {
    if (err) {
      console.error("Error reading images:", err);
      return res.status(500).send({ message: "Failed to load images" });
    }

    // Filter only image files (optional)
    const imageFiles = files.filter(file =>
      /\.(jpg|jpeg|png|gif)$/i.test(file)
    );

    // Build full URLs
    const imageUrls = imageFiles.map(
      file => `${req.protocol}://${req.get("host")}/doc-images/${file}`
    );

    res.status(200).send(imageUrls);
  });
});

module.exports = router;
