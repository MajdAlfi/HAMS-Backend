const express = require("express")
const cors = require('cors');
const path = require("path");
const login = require("../Auth/post/login")
const register = require("../Auth/post/register")
const getUser = require("../Auth/get/getUserData")
const getApt = require('../Patient/get/getPatientApt')
const getDoc = require('../Patient/get/getDoctorsList')
const getDocData = require('../Auth/get/getDocData')
const getDocAva = require('../Patient/get/getAvailabilityDoc')
const imageRoutes = require("../middleware/getIMGs");
const getTimeSlots = require("../Patient/get/getTimeSlots");
const bookApt = require("../Patient/post/bookApt");
const suggest = require('../Patient/post/getSuggest');
const getUserAppointments = require('../Patient/get/getUserApt')
const getAppointmentById = require("../Patient/get/getAptId");
const cancelApt = require("../Patient/post/cancelApt");
const rescheduleRoute = require("../Patient/post/rescheduleApt.js");
const getDocAPt = require("../Doctor/get/getDocApt.js");
const getPatHistory = require("../Patient/get/getPatientHistory.js");
const getPatientHistoryDoc = require("../Doctor/get/getPatientHistoryDoc.js");
const cancelByDoctor = require("../Doctor/post/cancelAPtDoc.js");
const updateDiagnosisRoute = require("../Doctor/post/uodateDiagnosis.js");
const postAvailability = require("../Doctor/post/postAvailability.js");
const deleteSpecialOccasionRoute = require("../Doctor/post/deleteSP.js");


const app = express()
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 
app.use(cors())
app.use("/login",login)
app.use("/register",register)
app.use("/userdata",getUser)
app.use("/getApt",getApt)
app.use("/getDocList",getDoc)
app.use("/getDocData",getDocData)
app.use("/getTimeSlots",getTimeSlots)
app.use("/bookApt",bookApt)
app.use("/images", imageRoutes);
app.use("/getsuggest", suggest);
app.use("/getUserAppointments", getUserAppointments);
app.use("/cancelAPt", cancelApt);
app.use("/getAppointmentById", getAppointmentById);
app.use("/getPatHistory", getPatHistory);
app.use("/getDocAppointmentsByDate", getDocAPt);
app.use("/rescheduleAppointment", rescheduleRoute);
app.use("/getAptPatientDoc",getPatientHistoryDoc );
app.use("/getDoctorSchedule",postAvailability );
app.use("/getWeeklySchedule",getDocAva );
app.use("/updateDiagnosis", updateDiagnosisRoute);
app.use("/cancelAppointmentByDoctor", cancelByDoctor);
app.use("/deleteSpecialOccasion", deleteSpecialOccasionRoute);
app.use("/doc-images", express.static(path.join(__dirname, "../../assets/docIMGs")));
module.exports = app