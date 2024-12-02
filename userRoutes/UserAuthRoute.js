const UserAuth = require('express').Router();
const User = require("../models/UserModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verify = require("../middleware/verify");
const TemporaryUser = require('../models/TemporarlyUserMod')
const crypto = require('crypto');
const nodemailer = require('nodemailer')





UserAuth.post("/user_register", asyncHandler(async (req, res) => {
  try {
    const { fullname, email, password, phone } = req.body;

    if (!fullname) return res.status(400).json({ msg: "Your name cannot be empty" });
    if (!email) return res.status(400).json({ msg: "Your email cannot be empty" });
    if (!password) return res.status(400).json({ msg: "Password cannot be empty" });
    if (!phone) return res.status(400).json({ msg: "Phone number cannot be empty" });

    // Check if email already exists in permanent or temporary collections
    const emailExists = await User.findOne({ email }) || await TemporaryUser.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ msg: "The email exists, please use another" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a verification code
    const verificationCode = crypto.randomInt(100000, 999999);

    // Save user in the TemporaryUser collection
    const tempUser = new TemporaryUser({
      fullname,
      email,
      password: hashedPassword,
      phone,
      verificationCode,
    });

    await tempUser.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: { user: process.env.EMAIL_USER, 
             pass: process.env.EMAIL_PASSWORD  
      }
  });
 

    // Send verification code to user's email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification Code',
      text: `Your verification code is: ${verificationCode}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ msg: "A verification code has been sent to your email." });
  } catch (error) {
    console.error(`Error during registration: ${error.stack}`);
    res.status(500).json({ msg: `There was an error: ${error.message}` });
  }
}));



UserAuth.post("/verify_email", asyncHandler(async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({ msg: "Email and verification code are required." });
    }

    // Retrieve the user from the TemporaryUser collection
    const tempUser = await TemporaryUser.findOne({ email });

    if (!tempUser) {
      return res.status(400).json({ msg: "Verification code expired or invalid." });
    }

    // Check if the verification code matches
    if (tempUser.verificationCode !== parseInt(verificationCode, 10)) {
      return res.status(400).json({ msg: "Invalid verification code." });
    }

    // Move the user to the User collection
    const newUser = new User({
      fullname: tempUser.fullname,
      email: tempUser.email,
      phone: tempUser.phone,
      password: tempUser.password,
    });

    await newUser.save();

    // Remove the user from the TemporaryUser collection
    await TemporaryUser.deleteOne({ email });

    res.status(201).json({ msg: "Email verified, account created successfully!" });
  } catch (error) {
    console.error(`Error during verification: ${error.stack}`);
    res.status(500).json({ msg: `There was an error: ${error.message}` });
  }
}));


UserAuth.post("/resend_verification", asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email is required." });
    }

    // Retrieve the user from the TemporaryUser collection
    const tempUser = await TemporaryUser.findOne({ email });

    if (!tempUser) {
      return res.status(400).json({ msg: "User not found or verification code expired." });
    }

    // Generate a new verification code
    const newCode = crypto.randomInt(100000, 999999);
    tempUser.verificationCode = newCode;
    tempUser.createdAt = Date.now(); // Reset expiration timer

    await tempUser.save();

    // Send the new verification code to the user's email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Resend Verification Code',
      text: `Your new verification code is: ${newCode}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ msg: "A new verification code has been sent to your email." });
  } catch (error) {
    console.error(`Error during resend: ${error.stack}`);
    res.status(500).json({ msg: `There was an error: ${error.message}` });
  }
}));







UserAuth.post("/user_login", asyncHandler(async(req, res) => {
  const { email, password } = req.body;

  const userExists = await User.findOne({ email }).select("+password");
  

  if (!userExists) {
    res.json({
      msg: "No user associated with this email exists in our system. Please register.",
    });
  }

  const passwordMatch = await bcrypt.compare(password, userExists.password);

  if (passwordMatch) {
    
    let refreshtoken = createRefreshToken({id: userExists._id})

    res.cookie('refreshtoken', refreshtoken, { expire: new Date() + 9999 });

    jwt.verify(refreshtoken, process.env.REFRESH_TOKEN, (err, user) =>{
      if(err) return res.status(400).json({msg: "Please Login or Register"})
  
      const accesstoken = createAccessToken({id: user.id})
      
  
      res.json({accesstoken}) })


    
  } else {
    res.json({ msg: "check your password again" });
  } 


  
}))



UserAuth.get('/auth/user',verify, asyncHandler(async(req, res) => {
  try{
    const user = await User.findById(req.user).select('-password')
    if(!user) return res.json({msg: "User does not exist."})
  
    res.json({user})
  
  
  }
    catch(err) {
      return res.json({msg: err.message})
  
  
    }
  
  
  }))




const createAccessToken = (user) =>{
  return jwt.sign(user, process.env.ACCESS_TOKEN, {expiresIn: '7d'})
}
const createRefreshToken = (user) =>{
  return jwt.sign(user, process.env.REFRESH_TOKEN, {expiresIn: '7d'})
}



module.exports = UserAuth;
