// models/Token.js
import { Schema, model } from "mongoose";

const tokenSchema = new Schema({
  hospitalId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  departmentId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true
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
  }
});

const TokenModel = model("Token", tokenSchema);
export default TokenModel;
