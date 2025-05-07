const auth = require('../../middleware/authCheck')
const docModel = require("../../Model/doctor")
const weekly = require("../../Model/weeklySchedule")
const express = require("express")
const router = express.Router()
router.get('/getDoc',auth,async (req,res) =>{
    try{
    const {uid} = req.headers
const dataDoc = await docModel.find({uid:uid})
console.log(dataDoc[0])
res.status(200).send(dataDoc[0]);
}catch(e){
    res.status(400).send('an error Occurred :(')
}
})
// router.get('/getWeekly',auth,async (req,res) =>{
//     try{
//     const {uid} = req.headers

// const dataWeek = await weekly.find({uid:uid})
// res.status(200).send(dataWeek);
// }catch(e){
//     res.status(400).send('an error Occurred :(')
// }
// })
module.exports = router;