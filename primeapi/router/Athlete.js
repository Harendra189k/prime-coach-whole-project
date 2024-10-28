const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Athlete = require("../models/athleteSchema");
const CryptoJS = require("crypto-js");
const nodemailer = require("nodemailer");
const cors = require('cors');
const AtheletModal = require("../models/athleteSchema");
require('dotenv').config();
const bcrypt = require('bcrypt')

router.use(cors());


// Athlete SignUP
router.post("/athletesign", async (req, res) => {
  const { firstName, lastName, email, phone, password, height, weight, membershipType, membershipDate } = req.body;

  // Basic validation
  if (!firstName || !lastName || !email || !phone || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const savedAthlete = await AtheletModal.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword,
      height: req.body.height,
      weight: req.body.weight,
      membershipType: req.body.membershipType,
      membershipDate: req.body.membershipDate,
    });
    res.status(201).json({savedAthlete, message: "Data created successfully", status: 201 });
  } catch (err) {
    res.status(500).json(err);
  }
});



// Athlete Login with JWT token

router.post("/athletelogin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const athlete = await Athlete.findOne({ email });

    if (!athlete) {
      return res.status(401).json({ message: "Athlete not found." });
    }

    const isMatch = await bcrypt.compare(password, athlete.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password." });
    }

    const token = jwt.sign(
      { email: athlete.email, _id: athlete._id },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.status(200).json({
      message: "Login successful.",
      token: token,
      athlete: athlete,
      status: 200
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});


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


router.post('/athlete-forgotpassword', async (req, res) => {
  const { email } = req.body;

  try {
      const user = await Athlete.findOne({ email });
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


router.post('/athlete-verify-reset-code', async (req, res) => {
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


router.post('/athlete-change-password', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await Athlete.findOneAndUpdate({ email }, { password: hashedPassword });

      delete resetCodes[email];

      res.status(200).json({ status: 200, message: 'Password changed successfully' });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'An error occurred', error: err });
  }
});




module.exports = router;
