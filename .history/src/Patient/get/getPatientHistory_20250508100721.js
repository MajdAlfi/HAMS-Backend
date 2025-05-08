const express = require('express')
const router = express.Router()
const aptModel = require('../../Model/appointments')
const docModel = require('../../Model/doctor')
const auth = require('../../middleware/authCheck')

router.get('/',auth,async(req,res)=>{
    try{
        const {uid} = req.headers 
        console.log(uid)
        const docList = []
        const aptHistory = await aptModel.find({uidPatient:uid}).sort({Apt: -1})
        for(var i = 0; i<aptHistory.length;i++){
            const doc = await docModel.findOne({ uid: aptHistory[i]["uidDoc"] });
            if (doc) {
              docList.push({ name: doc.name, img: doc.img });
            } else {
              docList.push({ name: "Unknown", img: "" });
            }
        }
        const result = {listNames:docList,listAptHistory:aptHistory}
    res.status(200).send(result);
    }catch(e){
res.status(400).send("An Error occurred")
    }
})
module.exports = router;