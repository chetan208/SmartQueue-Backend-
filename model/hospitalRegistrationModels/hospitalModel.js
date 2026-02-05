import mongoose, {Schema,Model} from 'mongoose'

import bcrypt from 'bcryptjs';

const hospitalSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    phoneNumber:{
        type: String,
    },
    address:{
        type: Schema.Types.ObjectId,
        ref: 'Address'
    },
    hospitalDiscription:{
        type: String,
    },
    password:{
        type: String,
    },
    website:{
        type: String,
    },
    departments:[{
        type: Schema.Types.ObjectId,
        ref: 'Department'
    }],
    branding:{
        logo:{
            type: Schema.Types.ObjectId,
            ref: 'Image'
        },
        banner:{
            type: Schema.Types.ObjectId,
            ref: 'Image'
        }
    },

    policiesAndTerms:[
       {
        type: Schema.Types.ObjectId,
        ref: 'PolicyAndTerm'
       }
    ],

    isVerified:{
        type: Boolean,
        default: false
    },

    hospitalType:{
        type: String,
    },

    hospitalTimings:{
        type: String,
    },

    otp:{
        type: Number,
    },

    otpExpiry:{
        type: Date,
    }

},
{
    timestamps: true
});



hospitalSchema.pre('save', async function(){

    if(!this.password){
        return;
    }

    if(!this.isModified('password')){
        return;
    }
    const salt = await bcrypt.genSalt(10);

    this.password =  await bcrypt.hash(this.password, salt);
})



const hospitalModel = mongoose.model('Hospital',hospitalSchema);

export default hospitalModel;