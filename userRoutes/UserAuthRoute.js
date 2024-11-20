const UserAuth = require('express').Router()
const User = require("../models/UserModel")
const asyncHandler = require("express-async-handler")
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


UserAuth.post("/user_register", asyncHandler(async(req, res) => {


    try {

        const {fullname, email, password} = req.body

        if(!fullname) res.json({msg: "your name cannot be empty"})

        if(!email) res.json({msg: "your email cannot be empty"})
            
        if(!password) res.json({msg: "password cannot be empty"})    

        if (!req.files || !req.files.userPhoto) {
                return res.json({ message: 'No file uploaded' });
              }


        const photoResult = await cloudinary.uploader.upload(req.files.userPhoto.tempFilePath);
          



            
            const emailExists = await User.findOne({ email });
            if (emailExists) {
              return res.json({ msg: "The email exists, please use another" });
            }
          
            
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
          
            
            
            const user =  await User ({
                fullname,
                userPhoto: photoResult,
                email,
                password: hashedPassword
              });

              await user.save()
              fs.unlinkSync(req.files.userPhoto.tempFilePath);

          
              res.json({ msg: "Your account has been successfully created!" });
              

        
    } catch (error) {

        res.json({msg: `there was an error ${error}`})
        
    }

} ))


module.exports = UserAuth
