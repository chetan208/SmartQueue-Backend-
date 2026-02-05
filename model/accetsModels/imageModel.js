import {model, Schema} from 'mongoose';

const imageSchema = new Schema({
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    type: { type: String },
}, { timestamps: true });

const imageModel = model('Image', imageSchema);

export default imageModel;