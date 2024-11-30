const UserDriver = require('express').Router();
const DriverVeri = require('../models/UserDriverVeri'); 
const verify = require('../middleware/verify'); 
const asyncHandler = require('express-async-handler');
const cloudinary = require("cloudinary").v2;


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});


UserDriver.post(
  '/user_driver_verification/:id',
  verify,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params; 
     

    
      if (!req.files || !req.files.idPhotoFront || !req.files.idPhotoBack) {
        return res.status(400).json({ msg: 'Both ID photos are required.' });
      }

      
      const idPhotoFront = await cloudinary.uploader.upload(
        req.files.idPhotoFront.tempFilePath,
        { folder: 'user_driver_verification' } 
      );

      const idPhotoBack = await cloudinary.uploader.upload(
        req.files.idPhotoBack.tempFilePath,
        { folder: 'user_driver_verification' }
      );

      
      const newVerification = await DriverVeri.create({

        userName: id,
        idPhotoFront: idPhotoFront.secure_url,
        idPhotoBack: idPhotoBack.secure_url,
      });

      res.status(201).json({
        msg: 'User driver verification uploaded successfully.',
        verification: newVerification,
      });
    } catch (error) {
      res.status(500).json({ msg: `There was an error: ${error.message}` });
    }
  })
);



module.exports = UserDriver;
