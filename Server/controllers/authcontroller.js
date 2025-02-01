import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/usermodel.js";
import transporter from "../config/nodemailer.js";
import {
  WELCOME_EMAIL,
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} from "../config/emailTemplates.js";

//Registration controller func
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing Details" }); //The return keyword here is used to stop the function running when  required is not found
  }
  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.json({ success: false, message: "Email Already Exist" });
    }
    const hashedPassword = await bcrypt.hash(password, 10); //can have a range b/w 5-15

    const user = new userModel({ name, email, password: hashedPassword });
    await user.save(); // To save new user in the database

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    }); // consist of basically 3 params which are payload, secret-key and options

    res.cookie("token", token, {
      httpOnly: true, //prevents the client-side from accessing the cookie
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, //expiration date for the cookie (7days) converted to milliseconds
    });

    //Sending a welcome email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to SkillBridge",
      text: `Welcome to SkillBridge Platform, Your account has been created with the email id: ${email}`,
      html: WELCOME_EMAIL.replace("{{email}}", email),
    };
    await transporter.sendMail(mailOptions);

    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Login controller func
const logIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email and password are required",
    });
  }
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password); //comparing the password gotten from the request body and the saved on in the database

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, //expiration date for the token 7days converted to milliseconds
    });

    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Logout controller func
const logOut = async (req, res) => {
  try {
    //Removing the cookie from the response
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, message: "Logged out" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//sending the verification OTP to user's email
const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId); // the userId is gotten from the token
    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account already verified" });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000)); //Here a random otp number is generated and rounded up to its whole number and then converted to a string data type
    user.verifyOtp = otp;
    user.verifyOtpExpiredAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      // text: `Your OTP is ${otp}. Verify your account using this OTP.`,
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };
    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "Verification OTP sent on email",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//To verify the OTP sent to the user's email as to verify the user.
const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    if (user.verifyOtpExpiredAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpiredAt = 0;

    await user.save();

    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Check if user is authenticated
const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Send password Reset OTP
const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000)); //Here a random otp number us generated and rounded up to its whole number and then converted to a string data type
    user.resetOtp = otp;
    user.resetOtpExpiredAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      // text: `Your OTP for resting your password is ${otp}.
      //  Use this OTP to proceed with resetting your password.`,
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };
    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Reset user password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "Email, OTP and new Password are required",
    });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    if (user.resetOtpExpiredAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpiredAt = 0;

    await user.save();
    return res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export {
  register,
  logIn,
  logOut,
  sendVerifyOtp,
  verifyEmail,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
};
