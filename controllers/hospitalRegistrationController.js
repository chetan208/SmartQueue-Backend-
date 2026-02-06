import hospitalModel from "../model/hospitalRegistrationModels/hospitalModel.js";
import sendOTPEmail from "../services/sendEmail.js";
import addressModel from "../model/accetsModels/addressModel.js";
import bcrypt from 'bcryptjs';
import { generateTokenForHospital, generateTokenForUser } from "../services/generateToken.js";
import imageModel from "../model/accetsModels/imageModel.js"
import uploadBufferToCloudinary from "../config/uploadToCloudinary.js";
import usermodel from "../model/Users/usermodel.js";

const registerHospital = async (req, res) => {
  const { name, email, password, website, hospitalType, hospitalTimings, address } =
    req.body;

  try {
    // Check if hospital with the same email already exists
    const existingHospital = await hospitalModel.findOne({ email });

    if (existingHospital && existingHospital.isVerified) {
      return res
        .status(400)
        .json({ message: "Hospital with this email already exists." });
    }

    if (existingHospital && !existingHospital.isVerified) {
      await addressModel.findByIdAndDelete(existingHospital.address);
      await hospitalModel.findByIdAndDelete(existingHospital._id);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const newAddress = await addressModel.create({
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country
    });

    const newHospital = new hospitalModel({
      name,
      email,
      password,
      website,
      hospitalType,
      hospitalTimings,
      address: newAddress._id,
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000, // 5 minutes from now
    });


    await sendOTPEmail(email, otp);



    await newHospital.save();

    await usermodel.create({
      name: name,
      email: email,
      password: password,
      role: 'hospitalAdmin'
    });

    res.status(201).json({
      success: true,
      message:
        "Hospital registered successfully. Please verify your email with the OTP sent.",
    });
  } catch (error) {
    console.log("Error registering hospital:", error);
    res.status(500).json({ message: "Error registering hospital.", error });
  }
};

const verifyHospitalEmail = async (req, res) => {
  const { email } = req.params;
  const { otp } = req.body;

  try {
    const hospital = await hospitalModel.findOne({ email });
    if (!hospital) {
      return res.json({
        success: false,
        message: "Hospital not found.",
      });
    }
    if (hospital.isVerified) {
      return res.json({
        success: false,
        message: "Hospital already verified.",
      });
    }
    if (hospital.otp != otp) {
      return res.json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    if (Date.now() > hospital.otpExpiry) {
      return res.json({
        success: false,
        message: "OTP has expired.",
      });
    }

    await hospitalModel.findByIdAndUpdate(hospital._id, {
      $set: { isVerified: true },
      $unset: { otp: "", otpExpiry: "" },
    });

    res.json({ success: true, message: "Hospital verified successfully." });
  } catch (error) {
    console.log("Error verifying hospital email:", error);
    res.json({
      success: false,
      message: "Error verifying hospital email.",
    });
  }

};

const loginHospital = async (req, res) => {
   
  const { email, password } = req.body;
  try {

    const hospital = await hospitalModel.findOne({ email });
    if (!hospital) {
      return res.json({
        success: false,
        message: "Hospital not found.",
      });
    }
    if (!hospital.isVerified) {
      return res.json({
        success: false,
        message: "Hospital email not verified.",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, hospital.password);

    if (!isPasswordValid) {
      return res.json({
        success: false,
        message: "Invalid password.",
      });
    }

    const token = generateTokenForHospital(hospital);

    res
      .cookie("hospitalToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      })
      .json({
        success: true,
        message: "Hospital logged in successfully.",
      });
    
  } catch (error) {
    console.log("Error logging in hospital:", error);
    res.json({
      success: false,
      message: "Error logging in hospital.",
    });
  }
  
}

const setPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    const hospital = await hospitalModel.findOne({ email });
    if (!hospital) {
      return res.json({
        success: false,
        message: "Hospital not found.",
      });
    }

    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "User not found.",
      });
    }
    const salt=bcrypt.genSaltSync(10);
    const hash=bcrypt.hashSync(password,salt);

    user.password=hash;
    user.isVerified = true;
    await user.save();  

    hospital.password = hash;
    await hospital.save();

    const newUser = await usermodel.findOne({email})

    const token = generateTokenForUser(newUser);
    
    res
            .cookie("token",token,{
                httpOnly:true,
                secure:true,
                sameSite:'None',
            })

            .json({
                success: true,
                message: "password set successfully",
                role: user.role
            })
  
  } catch (error) {
    console.log("Error setting hospital password:", error);
    res.json({
      success: false,
      message: "Error setting hospital password.",
    });
  }
};

const branding = async (req, res) => {
  const {hospitalEmail} = req.body;


  const {logo, banner} = req.files;

  console.log(logo);

  try {
    const hospital = await hospitalModel.findOne({ email: hospitalEmail });
    if (!hospital) {
      return res.status(404).json({success:false, message:"Hospital not found."});
    }
    
    if (logo && logo.length > 0) {
      const result = await uploadBufferToCloudinary(logo[0].buffer, "hospital_branding/logos");

      const image=await imageModel.create({
        url: result.secure_url,
        publicId: result.public_id,
        type: "logo",
      })

      hospital.branding.logo=image._id;
    
    }

    if (banner && banner.length > 0) {
      const result = await uploadBufferToCloudinary(banner[0].buffer, "hospital_branding/banners");

       const image=await imageModel.create({
        url: result.secure_url,
        publicId: result.public_id,
        type: "banner",
      })

      hospital.branding.banner=image._id;
      
    }

    await hospital.save();

    res.json({success:true, message:"Branding images uploaded successfully."});

  } catch (error) {

    console.log("Error in branding upload:", error);
    return res.status(500).json({success:false, message:"Error uploading branding images."});
    
  }

  res.json({success:true, message:"Branding images uploaded successfully."})
}

export { registerHospital, verifyHospitalEmail, loginHospital, setPassword , branding };