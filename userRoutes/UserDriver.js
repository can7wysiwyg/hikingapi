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
     

    
      if (!req.files || !req.files.idPhotoFront || !req.files.idPhotoBack || !req.files.drivingLicence) {
        return res.status(400).json({ msg: 'all photos are required.' });
      }

      
      const idPhotoFront = await cloudinary.uploader.upload(
        req.files.idPhotoFront.tempFilePath,
        { folder: 'user_driver_verification' } 
      );

      const idPhotoBack = await cloudinary.uploader.upload(
        req.files.idPhotoBack.tempFilePath,
        { folder: 'user_driver_verification' }
      );

      const drivingLicence = await cloudinary.uploader.upload(
        req.files.drivingLicence.tempFilePath,
        { folder: 'user_driver_verification' }
      );


      
       await DriverVeri.create({

        userName: id,
        idPhotoFront: idPhotoFront.secure_url,
        idPhotoBack: idPhotoBack.secure_url,
        drivingLicence: drivingLicence.secure_url
      });

      res.status(201).json({
        msg: 'User driver verification uploaded successfully.',
      });
    } catch (error) {
      res.status(500).json({ msg: `There was an error: ${error.message}` });
    }
  })
);



module.exports = UserDriver;
