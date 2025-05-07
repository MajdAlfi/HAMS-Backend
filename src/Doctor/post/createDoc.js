const express = require('express')
const router = express.Router()
const auth = require('../../middleware/authCheck')
const hospital = require('../../Model/Hospitals')
const userModel = require('../../Model/user')
const docModel = require('../../Model/doctor')

router.post('/',auth,async (req,res)=>{
    try{

        const {uid,Hospital,img,desc} = req.body
        const user = await userModel.find({_id:uid})
        const name = user[0]['name'] 
        await docModel.create({

            uid:uid,
            Sat:false,
            Sun:false,
            Mon:true,
            Tus:true,
            Wed:true,
            Thurs:true,
            Fri:true,
            workingHourFrom:"9",
            workingHourTo:"20",
            desc:desc,
            name:`Dr. ${name}`,
            Hospital:Hospital,
            img:img
        })
        
       res.status(200).send('Done')
    }catch(e){
        res.status(400).send(e)
    }


})
module.exports = router