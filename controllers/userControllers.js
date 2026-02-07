import usermodel from "../model/Users/usermodel.js";
import TokenCounter from "../model/Users/TokenCounter.js";
import TokenModel from "../model/Users/Token.js";
import { generateTokenForUser } from "../services/generateToken.js";
import sendOTPEmail from "../services/sendEmail.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { io } from "../index.js";

const registerUser = async (req, res) => {
  const { name, email, password, PhoneNumber } = req.body;

  if (!name || !email || !password) {
    return res.json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const existingUser = await usermodel.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.json({
        success: false,
        message: "User already exists with this email",
      });
    }

    if (existingUser && !existingUser.isVerified) {
      await usermodel.deleteOne({ email });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    await sendOTPEmail(email, otp);

    const newUser = await usermodel.create({
      name,
      email,
      password,
      PhoneNumber,
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      user: newUser,
    });
  } catch (error) {
    console.log("Error registering user:", error);
    res.json({
      success: false,
      message: "Error registering user",
    });
  }
};

const verifyUser = async (req, res) => {
  const { email } = req.params;
  const { otp } = req.body;

  try {
    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.json({
        success: true,
        message: "User already verified",
      });
    }
    if (user.otp !== parseInt(otp)) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }
    if (user.otpExpiry < Date.now()) {
      return res.json({
        success: false,
        message: "OTP has expired",
      });
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const newUser = await usermodel.findOne({ email });

    const token = generateTokenForUser(newUser);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      })

      .json({
        success: true,
        message: "User verified and logged in successfully",
        role: newUser.role,
      });
  } catch (error) {
    console.log("Error verifying user:", error);
    res.json({
      success: false,
      message: "Error verifying user",
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }
    if (!user.isVerified) {
      return res.json({
        success: false,
        message: "User is not verified",
      });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    

    if (!isPasswordValid) {
      return res.json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = generateTokenForUser(user);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      })

      .json({
        success: true,
        message: "User logged in successfully",
        role: user.role,
      });
  } catch (error) {
    console.log("Error logging in user:", error);
    res.json({
      success: false,
      message: "Error logging in user",
    });
  }
};

const generateTokenForPatient = async (req, res) => {
  const { hospitalId, departmentId, departmentName, patientData } = req.body;

  if (!hospitalId || !departmentId) {
    return res.json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    // today date (YYYY-MM-DD)
    const today = new Date();

    const formattedDate = `${String(today.getDate()).padStart(2, "0")}-${String(
      today.getMonth() + 1,
    ).padStart(2, "0")}-${today.getFullYear()}`;

    // STEP 1: increase counter safely
    const counter = await TokenCounter.findOneAndUpdate(
      { hospitalId, departmentId, date: formattedDate },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );

    // STEP 2: generate token
    const tokenNumber = counter.seq;
    const deptNamePart = departmentName
      .replace(/\s+/g, "")
      .toUpperCase()
      .substring(0, 4);
    const token = `${deptNamePart}-${formattedDate}-${tokenNumber}`;

    // STEP 3: save token
    const newToken = await TokenModel.create({
      hospitalId,
      departmentId,
      patientData,
      tokenNumber,
      token,
      date: formattedDate,
    });

    io.to(`admin-${departmentId}`).emit("new-token", newToken);

    res.json({
      success: true,
      tokenData: newToken,
    });
  } catch (error) {
    console.log("Token error:", error);
    res.json({
      success: false,
      message: "Token generation failed",
    });
  }
};

const getTokenDetails = async (req, res) => {
  const { id } = req.params;
  console.log("Fetching token details for ID:", id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  try {
    const tokenDetails = await TokenModel.findById(id)
      .populate("hospitalId")
      .populate("departmentId", "name");
    if (!tokenDetails) {
      return res.json({
        success: false,
        message: "Token not found",
      });
    }
    res.json({
      success: true,
      tokenDetails: tokenDetails,
    });
  } catch (error) {
    console.log("Error fetching token details:", error);
    res.json({
      success: false,
      message: "Error fetching token details",
    });
  }
};

const checkDepartmentAccess = async (req, res) => {
  const userEmail = req.user.email; // Assuming the middleware sets req.user

  try {
    const user = await usermodel.findOne({ email: userEmail }).populate({
      path: "departmentsAccess",
      select: "name status Doctors entrancePhoto",
      populate: {
        path: "entrancePhoto",
        select: "url",
      },
    });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }
    res.json({
      success: true,
      departmentsAccess: user.departmentsAccess,
    });
  } catch (error) {
    console.log("Error checking department access:", error);
    res.json({
      success: false,
      message: "Error checking department access",
    });
  }
};

const resumeToken = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // Assuming the middleware sets req.user

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    const token = await TokenModel.findById(id);
    if (!token) {
      return res.json({
        success: false,
        message: "Token not found",
      });
    }

    const existingUser = await usermodel.findById(userId);

    if (!existingUser.departmentsAccess.includes(token.departmentId)) {
      return res.json({
        success: false,
        message: "You don't have access to this department",
      });
    }

    token.status = "IN_PROGRESS";
    token.lastResumedAt = new Date();
    await token.save();
    res.json({
      success: true,
      message: "Token resumed successfully",
    });
  } catch (error) {
    console.log("Error resuming token:", error);
  }
};

const pauseToken = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // Assuming the middleware sets req.user

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    const token = await TokenModel.findById(id);
    if (!token) {
      return res.json({
        success: false,
        message: "Token not found",
      });
    }

    const existingUser = await usermodel.findById(userId);

    if (!existingUser.departmentsAccess.includes(token.departmentId)) {
      return res.json({
        success: false,
        message: "You don't have access to this department",
      });
    }

    token.status = "PAUSED";
    token.activeTime += Date.now() - token.lastResumedAt.getTime();
    await token.save();
    res.json({
      success: true,
      message: "Token paused successfully",
    });
  } catch (error) {
    console.log("Error pausing token:", error);
  }
};

const completeToken = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // Assuming the middleware sets req.user

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    const token = await TokenModel.findById(id);
    if (!token) {
      return res.json({
        success: false,
        message: "Token not found",
      });
    }

    const existingUser = await usermodel.findById(userId);

    if (!existingUser.departmentsAccess.includes(token.departmentId)) {
      return res.json({
        success: false,
        message: "You don't have access to this department",
      });
    }

    token.status = "COMPLETED";
    token.activeTime += Date.now() - token.lastResumedAt.getTime();
    await token.save();
    res.json({
      success: true,
      message: "Token completed successfully",
    });
  } catch (error) {
    console.log("Error completing token:", error);
  }
};


const getAverageQueueTime = async (req, res) => {
  const { departmentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(departmentId)) {
    return res.status(400).json({ message: "Invalid Department ID" });
  }

  try {

    const tokens = await TokenModel.find({
      departmentId: departmentId,
      status: "COMPLETED",
    }).select("activeTime");

    // 2️⃣ Edge case: no tokens
    if (tokens.length === 0) {
      return res.json({
        success: true,
        averageTimeMs: 5*60*1000, // default 5 minutes
        totalTokens: 0,
      });
    }

    // 3️⃣ Sum all activeTime
    let totalActiveTime = 0;

    tokens.forEach(token => {
      totalActiveTime += token.activeTime || 0;
    });

    // 4️⃣ Average
    const averageTimeMs = totalActiveTime / tokens.length;

    // 5️⃣ Response
    res.json({
      success: true,
      averageTimeMs,
      averageTimeMinutes: (averageTimeMs / 60000).toFixed(2),
      totalTokens: tokens.length,
    });
    
  } catch (error) {
    console.log("Error fetching average queue time:", error);
    res.json({ 
      success: false,
      message: "Error fetching average queue time" 
    });
  }

}

export {
  registerUser,
  verifyUser,
  loginUser,
  generateTokenForPatient,
  getTokenDetails,
  checkDepartmentAccess,
  resumeToken,
  pauseToken,
  completeToken,
  getAverageQueueTime
};
