const express = require('express')
const router = express.Router()

const auth = require('../../middleware/authCheck')

router.get('/',auth,async(req,res)=>{
    try{
const user  = await userModel.find({_id:uid})
if (user.length>0) {
    const userAdd = user[0]['address']
    const searchHospital = await hospital.find({
        $text: { $search: userAdd }

    })
    if(searchHospital.length > 0){
        return res.status(200).send(searchHospital[0]["HName"])
    }else{
        return res.status(200).send("No Close by hospital")
    }
   
}
return res.status(400).send("user does not exist")
}catch(e){
    res.status(400).send("An Error occurred")
        }
    })
    module.exports = router;