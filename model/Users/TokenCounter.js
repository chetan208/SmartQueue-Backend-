// models/TokenCounter.js
import { Schema, model } from "mongoose";

const tokenCounterSchema = new Schema({
  hospitalId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  departmentId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  seq: {
    type: Number,
    default: 0
  }
});

// VERY IMPORTANT
tokenCounterSchema.index(
  { hospitalId: 1, departmentId: 1, date: 1 },
  { unique: true }
);

const TokenCounter = model("TokenCounter", tokenCounterSchema);
export default TokenCounter;
