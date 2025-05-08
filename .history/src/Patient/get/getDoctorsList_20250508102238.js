const express = require('express')
const router = express.Router()
const doctorsModel = require("../../Model/doctor")
router.get('/',async (req,res)=>{
    try{
 
        const dataDoc = await doctorsModel.find({})

        res.status(200).send({dataDoc:dataDoc})
    }catch (e) {
        res.status(400).send(e.message || 'Unknown error');
      }


})
module.exports = router