

const { default: mongoose } = require("mongoose");

const weeklySchedule = mongoose.Schema({
    uid:{required:true,type:String},
    Sunday:{required:true,type:Boolean },
    Monday:{required:true,type:Boolean },
    Tuesday:{required:true,type:Boolean},
    Wednesday:{required:true,type:Boolean},
    Thursday:{required:true,type:Boolean},
    Friday:{required:true,type:Boolean},
    Saturday:{required:true,type:Boolean },
    workingHourFrom:{required:true,type:String},
    workingHourTo:{required:true,type:String},
})
const dataModel = mongoose.model('weeklySchedule',weeklySchedule)
module.exports = dataModel;