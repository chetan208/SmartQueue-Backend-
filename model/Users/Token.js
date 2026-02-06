// models/Token.js
import { Schema, model } from "mongoose";

const tokenSchema = new Schema({
  hospitalId: {
    type: Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },
  departmentId: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    required: true
  },
  patientData: {
    name: { type: String},
    age: { type: Number },
    contactNumber: { type: String },
    visitType: { type: String, },
    contactNumber: {
    type: String,
  }
  },
  tokenNumber: {
    type: Number,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["WAITING", "IN_PROGRESS", "COMPLETED"],
    default: "WAITING"
  },
  
});

const TokenModel = model("Token", tokenSchema);
export default TokenModel;
