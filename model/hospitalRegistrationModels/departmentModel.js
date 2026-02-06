import { model, Schema } from "mongoose";

const departmentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  entrancePhoto: {
    type: Schema.Types.ObjectId,
    ref: "Image",
  }, 
  workingSchedule: {
    is24X7: {
      type: Boolean,
      default: false, 
    },
    workingDays: [{ type: String }],
    timeSlots: [
      {
        openingTime: { type: String},
        closingTime: { type: String,},
      },
    ],

    
  },
  Doctors:[
        { type: Schema.Types.ObjectId, ref: "Doctor" }
    ],

  additionalPhotos: [
    {
      type: Schema.Types.ObjectId,
      ref: "Image",
    },
  ],
  status:{
    type: String,
    enum: ['Active','Inactive'],
    default: 'Active'
  },
  departmentAddress:{
    floorNumber: { type: String },
    wing: { type: String },
    landmark: { type: String },
    hasSpecialBuilding: { type: Boolean, default: true }
  },
  admins:[
    { type: Schema.Types.ObjectId, ref: "User" }
  ]
});

const departmentModel = model("Department", departmentSchema);

export default departmentModel;
