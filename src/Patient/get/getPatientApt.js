const express = require('express')
const router = express.Router()
const aptModel = require('../../Model/appointments')
const auth = require('../../middleware/authCheck')

router.get('/',auth,async(req,res)=>{
    try{
        const {uid} = req.headers
       const apt = await aptModel.find({uid:uid})
       res.status(200).send(apt)
    }catch(e){
res.status(400).send("An Error occurred")
    }
})
module.exports = router;