const express = require('express')
const router = express.Router()
const weekModel = require("../../Model/weeklySchedule")
router.get('/',async (req,res)=>{
    try{
        const {uid} = req.headers
        const data = await weekModel.find({uid:uid})
        
        res.status(200).send({dataWeek:data})
    }catch(e){
        res.status(400).send(e.message || 'Error fetching schedule');
    }


})
module.exports = router