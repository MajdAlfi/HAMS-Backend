const bcrypt = require('bcrypt')
const userModel = require('../../Model/user')
const jwt = require('jsonwebtoken')
const express = require('express')
const router = express.Router()
router.post('/',async (req , res )=>{
    try{
    
    const {phoneNo,password} = req.body
    if(!(phoneNo&&password)){
   
             return res.status(400).send('Please enter a Phone Number and a password')

       
    }
    const findPhoneNo = await userModel.findOne({phoneNo:phoneNo})
    if(!findPhoneNo){
    
            return res.status(404).send('Phone Number does not exist')
        
        
    }

    if(findPhoneNo && (await bcrypt.compare(password,findPhoneNo.password))){
        const token = jwt.sign(
            { user_id: findPhoneNo._id, phoneNo:phoneNo,accountType:findPhoneNo.accountType },
            process.env.TOKEN_KEY,
            {
              expiresIn: "3d",
            }
          );

          return res.status(200).send(token);
    }

        return res.status(400).send("Invalid Credentials");

    
    }catch(err){
        res.status(400).send('err')
    }
})

module.exports = router;