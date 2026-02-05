import {model,Schema} from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
       
    },
    PhoneNumber:{
        type:String,
    
    },
    profilePicture:{
        type:Schema.Types.ObjectId,
        ref:'Image'
    },
    role:{
        enum:['departmentAdmin','hospitalAdmin','user'],
        type:String,
        default:'user'
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    otp:{
        type:Number,
    },
    otpExpiry:{
        type:Date,
    }
},{timestamps:true})

userSchema.pre('save',function(){
    const user=this;
    user.email=user.email.toLowerCase();
    if(user.isModified('password')){
        return;
    }

    const salt=bcrypt.genSaltSync(10);
    const hash=bcrypt.hashSync(user.password,salt);
    user.password=hash;
})


const usermodel=model('User',userSchema);

export default usermodel;  