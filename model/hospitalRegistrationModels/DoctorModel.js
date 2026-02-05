import {model, Schema} from "mongoose";

const doctorSchema=new Schema({
    name:{
        type:String,
        required:true,
    },
    specialization:{
        type:String,
        required:true,
    },
    availableDays:[{type:String}],
})

const DoctorModel=model('Doctor',doctorSchema);

export default DoctorModel;