const express = require('express')
const jwt  = require('jsonwebtoken')
const router = express.Router()
const User = require('../../Model/user')
const bcrypt = require('bcrypt')
const docModel = require('../../Model/doctor')
const upload = require('../../middleware/storeIMG')
const weekly = require('../../Model/weeklySchedule')
router.post("/", upload.single("img"), async (req, res) => {
    try { 
         console.log("BODY:", req.body);
      console.log("FILE:", req.file);
      const {
        phoneNo,
        password,
        address,
        Gender,
        DOB,
        Name,
        accountType,
        isDoc,
        Specialization,
        Hospital
      } = req.body;
    
//   console.log(phoneNo,
//     password,
//     address,
//     Gender,
//     DOB,
//     Name,
//     accountType,
//     isDoc,
//     Specialization,
//     Hospital)
      if (!(password && address && Gender && Name && accountType && phoneNo && DOB && (isDoc != null))) {
        return res.status(400).send({ message: "All inputs are required" });
      }
  
      const oldUser = await User.findOne({ phoneNo });
      if (oldUser) {
        return res.status(409).send({ message: "User Already exists" });
      }
  
      if (password.length < 6) {
        return res.status(400).send({ message: "Password is too Short (min 6 characters)" });
      }
      if (isDoc === "true") {
        const nameExist = await docModel.findOne({ Name });
        if (nameExist) {
          return res.status(409).send({ message: "Name Already exists" });
        }
      }
  
      const encryptedPass = await bcrypt.hash(password, 10);
      const dateCreated = new Date();
  
      const user = await User.create({
        password: encryptedPass,
        DOB,
        Gender,
        Name,
        accountType,
        address,
        dateCreated,
        phoneNo,
      });
  
      const token = jwt.sign(
        { user_id: user._id, phoneNo, accountType },
        process.env.TOKEN_KEY,
        { expiresIn: "3d" }
      );
  
      if (isDoc === "true") {
    
     
        const imagePath = req.file ? `${req.file.filename}` : "";
  
        await docModel.create({
          uid: user._id,
          desc: Specialization,
          name: `Dr. ${user.Name}`,
          Hospital: Hospital,
          img: imagePath,
        });
  
        await weekly.create({
          uid: user._id,
          Sunday: false,
          Monday: true,
          Tuesday: true,
          Wednesday: true,
          Thursday: true,
          Friday: true,
          Saturday: false,
          workingHourFrom: "9:30",
          workingHourTo: "17:00",
        });
      }
  
      return res.status(200).send(token);
    } catch (e) {
      console.error(e);
      res.status(400).send({ message: "err: " + e });
     }
  });
  
module.exports = router  