const mongoose = require("mongoose")
require('dotenv').config();
const {MONGO_URI} = process.env

exports.connect = ()=>{

    mongoose.connect(MONGO_URI,{useNewUrlParser:true,useUnifiedTopology:true}).then(
        ()=>{
            console.log("Connection to database has been Successful")          }).catch((error)=>{
                console.log("Connection to database has failed. due to ")
                console.error(error)
                process.exit(1)
  
        }
   )
}