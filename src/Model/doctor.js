

const { default: mongoose } = require("mongoose");

const Doctor = mongoose.Schema({
    uid:{required:true,type:String},
    desc:{required:true,type:String},
    name:{required:true,type:String},
    Hospital:{required:true,type:String},
    img:{required:true,type:String}
})
const dataModel = mongoose.model('Doctors',Doctor)
module.exports = dataModel;