

const { default: mongoose } = require("mongoose");

const specialOcations = mongoose.Schema({
    uid:{required:true,type:String },
    From:{required:true,type:Date},
    To:{required:true,type:Date},
 

})
const dataModel = mongoose.model('SpecialOcations',specialOcations)
module.exports = dataModel;