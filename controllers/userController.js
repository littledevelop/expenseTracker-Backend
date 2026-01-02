import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import axios from 'axios';
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({ name, email, password: hashedPassword });

    await newUser.save();

    //generate json  jwt token (optional)

    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie(token, {
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      // token:token
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userResponse,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(401)
        .json({ success: false, message: "All fields are required" });
    }

    const user = await userModel.findOne({ email });
    console.log(user);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "user not found,Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(isPasswordValid);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie(token, {
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      token: token,
    };

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: userResponse,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const sendResetPasswordEmail = async (toEmail, resetLink) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: process.env.FROM_NAME,
          email: process.env.FROM_EMAIL,
        },
        to: [{ email: toEmail }],
        subject: "Password Reset Request",
        htmlContent: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Password Reset</h2>
            <p>You requested to reset your password.</p>
            <p>
              <a href="${resetLink}"
                 style="background:#2563eb;color:#fff;padding:12px 18px;
                        text-decoration:none;border-radius:5px;">
                Reset Password
              </a>
            </p>
            <p>This link is valid for 15 minutes.</p>
            <p>If you didn’t request this, please ignore.</p>
          </div>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          accept: "application/json",
        },
        timeout: 10000,
      }
    );
  } catch (error) {
    console.error(
      "Brevo Email Error:",
      error.response?.data || error.message
    );
    throw new Error("Email sending failed");
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email should not be blank" });
    }

    const user = await userModel.findOne({ email });

    if (user) {
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      const resetLink = `${process.env.FRONTEND_URL}/resetPassword/${token}`;

      console.log("Reset Link:", resetLink); // dev only

      await sendResetPasswordEmail(user.email, resetLink);
    }

    res.json({
      success: true,
      message: "If this email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    // 1️⃣ Validation
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized request" });
    }

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Update user password
    const user = await userModel.findByIdAndUpdate(
      decoded.userId,
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    // Token expired or invalid
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Reset link expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ success: false, message: "Invalid reset token" });
    }

    res.status(500).json({ success: false, message: "Server error" });
  }
};
export { register, login, forgotPassword, resetPassword };
