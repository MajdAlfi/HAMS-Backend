const { default: mongoose } = require("mongoose");

const hospitals = mongoose.Schema({
    HName:{required:true,type:String},
    address:{required:true,type:String},
    
    
})
const dataModel = mongoose.model('Hospitals',hospitals)
module.exports = dataModel;