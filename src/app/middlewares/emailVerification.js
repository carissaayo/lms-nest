import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

// Nodemailer transporter configuration
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME, // Your Gmail address
    pass: process.env.EMAIL_PASSWORD, // Your Gmail app password
  },
});

// Generate JWT token
export const generateToken = (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
};
