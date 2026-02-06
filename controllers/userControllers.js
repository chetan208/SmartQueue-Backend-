import usermodel from "../model/Users/usermodel.js";
import TokenCounter from "../model/Users/TokenCounter.js";
import TokenModel from "../model/Users/Token.js";
import { generateTokenForUser } from "../services/generateToken.js";
import sendOTPEmail from "../services/sendEmail.js";
import bcrypt from 'bcryptjs';

const registerUser=async(req,res)=>{
    const {name,email,password,PhoneNumber}=req.body;

    if(!name || !email || !password || !PhoneNumber){
        return res.json({
            success:false,
            message:"All fields are required"
        });
    }

    try {
        
        const existingUser=await usermodel.findOne({email});
        if(existingUser && existingUser.isVerified){
            return res.json({
                success:false,
                message:"User already exists with this email"
            });
        }

        if(existingUser && !existingUser.isVerified){
            await usermodel.deleteOne({email});
        }

        const otp=Math.floor(100000 + Math.random() * 900000);

        await sendOTPEmail(email,otp);

        const newUser= await usermodel.create({
            name,
            email,
            password,
            PhoneNumber,
            otp,
            otpExpiry: Date.now() + 5 * 60 * 1000
        })

        res.json({
            success:true,
            message:"User registered successfully. Please verify your email.",
            user:newUser
        })

    } catch (error) {
        console.log("Error registering user:", error);
        res.json({
            success:false,
            message:"Error registering user",
        })
    }
}

const verifyUser=async(req,res)=>{
    const {email}=req.params;
    const {otp}=req.body;

    try{
        const user=await usermodel.findOne({email});
        if(!user){
            return res.json({
                success:false,
                message:"User not found"
            });
        }



        if(user.isVerified){
            return res.json({
                success:true,
                message:"User already verified"
            });
        }
        if(user.otp !== parseInt(otp)){
            return res.json({
                success:false,
                message:"Invalid OTP"
            });
        }
        if(user.otpExpiry < Date.now()){
            return res.json({
                success:false,
                message:"OTP has expired"
            });
        }
        user.isVerified=true;
        user.otp=undefined;
        user.otpExpiry=undefined;
        await user.save();
        res.json({
            success:true,
            message:"User verified successfully"
        })
    } catch (error) {
        console.log("Error verifying user:", error);
        res.json({
            success:false,
            message:"Error verifying user"
        })
    }
}

const loginUser = async (req, res) => {
     const { email, password } = req.body;

     if (!email || !password) {
         return res.json({
             success: false,
             message: "Email and password are required"
         });
     }

     try {
        const user = await usermodel.findOne({ email });
        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }
        if (!user.isVerified) {
            return res.json({
                success: false,
                message: "User is not verified"
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.json({
                success: false,
                message: "Invalid password"
            });
        }

        const token = generateTokenForUser(user)

        res
            .cookie("token",token,{
                httpOnly:true,
                secure:true,
                sameSite:'None',
            })

            .json({
                success: true,
                message: "User logged in successfully",
                role: user.role
            })

        
     } catch (error) {
        console.log("Error logging in user:", error);
        res.json({
            success:false,
            message:"Error logging in user"
        })
     }

}

const generateTokenForPatient =  async (req, res) => {
  const { hospitalId, departmentId, patientData } = req.body;

  if (!hospitalId || !departmentId) {
    return res.json({
      success: false,
      message: "All fields are required"
    });
  }

  try {
    // today date (YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];

    // STEP 1: increase counter safely
    const counter = await TokenCounter.findOneAndUpdate(
      { hospitalId, departmentId, date: today },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // STEP 2: generate token
    const tokenNumber = counter.seq;
    const token = `T-${tokenNumber}`;

    // STEP 3: save token
    const newToken = await TokenModel.create({
      hospitalId,
      departmentId,
      userId,
      tokenNumber,
      token,
      date: today
    });

    res.json({
      success: true,
      token: newToken
    });

  } catch (error) {
    console.log("Token error:", error);
    res.json({
      success: false,
      message: "Token generation failed"
    });
  }
};


export {registerUser,verifyUser,loginUser,generateTokenForPatient};