const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const resetTokens = {};
const dotenv = require("dotenv");
const axios = require("axios");
dotenv.config();

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const user = await User.findOne({ email });

    if (user) {
      res.status(500).json({ message: "Already have Account" });
    }

    const newUser = new User({
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.json({ message: "Registration successful" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id,
      },
      "sa7735ty10775a1",
      { expiresIn: "1h" }
    );

    res.json({ token: token, userData: user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    console.log("email", email);
    // Generate a unique reset token
    const resetToken = uuidv4();

    // Store the reset token (in-memory, replace with database storage)
    resetTokens[email] = resetToken;

    // Send a password reset email
    await sendPasswordResetEmail(email, resetToken);

    res.json({
      message:
        "Password reset email sent. Please check your email for instructions.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Password reset failed" });
  }
};

const sendPasswordResetEmail = async (email, resetToken) => {
  // Create a nodemailer transporter using your email provider's SMTP settings
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_EMAIL,
    port: 465,
    secure: true,
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  const user = await User.findOne({ email });
  if (!user) {
    res.status(500).json({ message: "Email doesnt Account" });
  }

  // Send password reset email
  await transporter.sendMail({
    from: process.env.MAIL_SEND_FROM,
    to: email,
    subject: "Reset your password",
    text: `Click the following link to reset your password: http://localhost:3000/resetpassword?email=${email}&token=${resetToken}`,
  });
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;

    if (resetTokens[email] === token) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.updateOne({ email } , { password: hashedPassword });

      // Remove the reset token
      delete resetTokens[email];

      res.json({ message: "Password reset successful" });
    } else {
      // Token is invalid
      res.status(400).json({ message: "Invalid reset token" });
    }
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Password reset failed" });
  }
};

// exports.loginViaGoogle = async (req, res) => {
//   try {
//     const { access_token } = req.body; // Assuming the access token is sent in the request body
//     console.log("access_token", access_token);
//     const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
//       headers: {
//         'Authorization': `Bearer ${access_token}`
//       }
//     });
//     console.log("response::", response.data);
//     res.json({ user: response.data });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ message: "Login failed" });
//   }
// };
