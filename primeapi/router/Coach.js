const router = require("express").Router();
const jwt = require('jsonwebtoken');
const Coach = require("../models/coachSchema")
const CryptoJS = require("crypto-js");
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt')
require('dotenv').config();
const cors = require('cors');
router.use(cors());


// Coach SignUP 

router.post("/coachsign", async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  // Basic validation
  if (!firstName || !lastName || !email || !phone || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newCoach = new Coach({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
    });

    const savedCoach = await newCoach.save();
    res.status(201).json({ savedCoach, status: 201 });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: "Internal server error." });
  }
});


//COACH LOGIN
router.post("/coachlogin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const coach = await Coach.findOne({ email });

    if (!coach) {
      return res.status(401).json({ message: "Coach not found." });
    }

    const isMatch = await bcrypt.compare(password, coach.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password." });
    }

    const token = jwt.sign(
      { email: coach.email, _id: coach._id },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.status(200).json({
      message: "Login successful.",
      token: token,
      coach: coach,
      status: 200
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});



// FORGOT PASSWORD
const resetCodes = {};

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    secure: true,
    port: 465,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD        
    }
});


router.post('/coach-forgotpassword', async (req, res) => {
  const { email } = req.body;

  try {
      const user = await Coach.findOne({ email });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      resetCodes[email.toLowerCase()] = code;

      await transporter.sendMail({
          from: process.env.EMAIL,
          to: email,
          subject: 'Password Reset Code',
          text: `Your password reset code is: ${code}`
      });

      res.status(200).json({ status: 200, message: 'Reset code sent to your email' });

  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'An error occurred', error: err });
  }
});



// USE CODE

router.post('/coach-verify-reset-code', async (req, res) => {
  const { email, code } = req.body;

  try {
      const normalizedEmail = email.toLowerCase().trim(); 
      const storedCode = resetCodes[normalizedEmail];

      console.log(`Reset Code Sent: ${storedCode}, Code Received: ${code}`);

      if (storedCode && storedCode === code.trim()) {
          res.status(200).json({ status: 200, message: 'Code verified successfully' });
      } else {
          res.status(400).json({ message: 'Invalid code' });
      }
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'An error occurred', error: err });
  }
});


// RESET PASSWORD
router.post('/coach-change-password', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await Coach.findOneAndUpdate({ email }, { password: hashedPassword });

      delete resetCodes[email];

      res.status(200).json({ status: 200, message: 'Password changed successfully' });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'An error occurred', error: err });
  }
});


 

module.exports = router;