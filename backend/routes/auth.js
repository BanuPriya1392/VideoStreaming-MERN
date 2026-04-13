const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middlewares/auth.middleware");
const { getProfile, updateProfile, uploadAvatar } = require("../controllers/user.controller");
const sendEmail = require("../utils/sendEmail");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error(error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or username already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/profile/avatar", protect, upload.single("avatar"), uploadAvatar);

// Forgot Password - Send OTP
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Please provide an email" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP and expiration (10 minutes)
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send Email
    const message = `Your password reset OTP is: ${otp}. It is valid for 10 minutes.`;
    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset OTP",
        message,
      });

      res.status(200).json({ success: true, message: "OTP sent to email" });
    } catch (err) {
      console.error("Email sending failed:", err);
      console.log("-----------------------------------------");
      console.log(`FALLBACK: OTP for ${user.email} is: ${otp}`);
      console.log("-----------------------------------------");
      
      // Still return success in development/fallback mode so user can test
      return res.status(200).json({ 
        success: true, 
        message: "OTP sent (check server console for development)",
        isFallback: true 
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Please provide all fields" });
    }

    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Clear OTP fields
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
