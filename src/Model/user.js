const { default: mongoose } = require("mongoose");

const user = mongoose.Schema({
    phoneNo:{required:true,type:Number},
    address:{required:true,type:String},
    password:{required:true,type:String},
    DOB:{required:true,type:Date},
    Gender:{required:true,type:String},
    Name:{required:true,type:String},
    accountType:{required:true,type:String},
    dateCreated:{required:true,type:Date},
})
const dataModel = mongoose.model('User',user)
module.exports = dataModel;