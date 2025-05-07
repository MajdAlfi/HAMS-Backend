

const { default: mongoose } = require("mongoose");

const appointments = mongoose.Schema({
    Apt:{required:true,type:Date },
    uidDoc:{required:true,type:String},
    uidPatient:{required:true,type:String},
    Hospital:{required:true,type:String},
    State:{required:true,type:String},
    descPatient:{required:true,type:String},
    diagnosis:{required:true,type:String},
})
const dataModel = mongoose.model('Appointments',appointments)
module.exports = dataModel;