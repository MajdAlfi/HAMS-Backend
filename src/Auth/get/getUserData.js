const auth = require('../../middleware/authCheck')
const userModel = require("../../Model/user")
const express = require("express")
const router = express.Router()
router.get('/get',auth,async (req,res) =>{
    try{
    const {uid} = req.headers
const data = await userModel.findById({_id:uid})
res.status(200).send(data);
}catch(e){
    res.status(400).send('an error Occurred :(')
}
})
module.exports = router;