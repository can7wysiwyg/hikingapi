const UserUpdateRoute = require('express').Router()
const verify = require('../middleware/verify')
const User = require('../models/UserModel')
const asyncHandler = require('express-async-handler')
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});


UserUpdateRoute.put(
    '/user_update_photo/:id',
    verify,
    asyncHandler(async (req, res) => {
      try {
        const { id } = req.params;
        const Owner = await User.findById(req.user); 
        const userId = Owner._id.toString();
  
        if (userId !== id) {
          return res.json({ msg: "Hacking attacks are not tolerated" });
        }


        if (!req.files || Object.keys(req.files).length === 0) {
            return res.json({ msg: "No files were uploaded." });
          }
      
          const userPhoto = req.files.userPhoto;
      
          if (!userPhoto) {
            return res.json({ msg: "No image was selected." });
          }
      
          const result = await cloudinary.uploader.upload(userPhoto.tempFilePath);
          
      
          await User.findByIdAndUpdate(Owner._id, { userPhoto: result.secure_url });
      
          res.json({ msg: "Profile picture successfully updated." });
      
  
        
      } catch (error) {
        res.json({ msg: `There was a problem while updating the photo: ${error.message}` });
      }
    })
  );


  UserUpdateRoute.put('/user_info_update/:id', verify, asyncHandler(async(req, res) => {

    try {

        const { id } = req.params;
        const Owner = await User.findById(req.user); // Fetch authenticated user
        const userId = Owner._id.toString();
  
        if (userId !== id) {
          return res.json({ msg: "Hacking attacks are not tolerated" });
        }

        await User.findByIdAndUpdate(Owner, req.body, {new: true})

        res.json({msg: "successfully updated user info"})
    




        
    } catch (error) {
        res.json({msg: `there was a problem while updating the user info : ${error.message}`})
    }

  }))
    


module.exports = UserUpdateRoute