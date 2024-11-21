const UserAuth = require('express').Router();
const User = require("../models/UserModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verify = require("../middleware/verify");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

UserAuth.post("/user_register", asyncHandler(async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname) return res.json({ msg: "Your name cannot be empty" });
    if (!email) return res.json({ msg: "Your email cannot be empty" });
    if (!password) return res.json({ msg: "Password cannot be empty" });

    
    // if (!req.files || !req.files.userPhoto) {
    //   return res.json({ msg: "No file uploaded" });
    // }

    // Upload user photo to Cloudinary
    // const photoResult = await cloudinary.uploader.upload(req.files.userPhoto.tempFilePath);

    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.json({ msg: "The email exists, please use another" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user to database  userPhoto: photoResult.secure_url, // Save the image URL only
    const user = new User({
      fullname,
     
      email,
      password: hashedPassword,
    });

    await user.save();

    // Remove temporary file
    // fs.unlinkSync(req.files.userPhoto.tempFilePath);

    res.json({ msg: "Your account has been successfully created!" });
  } catch (error) {
    console.error(`Error during registration: ${error}`);
    res.json({ msg: `There was an error: ${error.message}` });
  }
}));


const users = [
  {
    id: 1,
    name: 'John Doe',
    email: 'johndoe@example.com',
    age: 25,
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'janesmith@example.com',
    age: 30,
  },
  {
    id: 3,
    name: 'Alice Johnson',
    email: 'alicej@example.com',
    age: 22,
  },
];



UserAuth.get('/api/users', (req, res) => {
  res.json(users); // Sends the JSON objects to the client
});

module.exports = UserAuth;
