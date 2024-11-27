const DriverInfoRoute = require('express').Router()
const User = require('../models/UserModel')
const Driver = require('../models/DriverModel')
const asyncHandler = require('express-async-handler')
const verify = require('../middleware/verify')
const verifyDriver = require('../middleware/verifyDriver')
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});


DriverInfoRoute.post('/driver_info_create', verify, verifyDriver, asyncHandler(async(req, res) => {

    try {

        const {driverCarPlate, driverCarCapacity} = req.body

        if(!driverCarPlate) res.json({msg: "car number plate cannot be empty"})

        if(!driverCarCapacity) res.json({msg: "you should specify the number of people your car carries"})
            
            
            if (!req.files || !req.files.driverCarPhoto) {
                return res.json({ msg: "your car Photo is required." });
              }
            
              const driver = new Driver({
                driverCarCapacity,
                driverCarPlate, 
                driverName: req.user.id,
              });

             
                         
                const driverCarPhoto = req.files.driverCarPhoto;
                console.log(driverCarPhoto)
                const result = await cloudinary.uploader.upload(driverCarPhoto.tempFilePath);
            
                
                driver.driverCarPhoto = result.secure_url;
            
                await driver.save();
            
                res.json({ msg: "You have successfully updated your info as a driver!" });     


    
        
    } catch (error) {
        res.json({msg: `there was a problem in updating the car photo: ${error.message}`})
    }



}))


DriverInfoRoute.put('/driver_car_photo_update/:id', verify, verifyDriver, asyncHandler(async(req, res) => {

try {

    const{id} = req.params
    const driver = await Driver.findById(id)

    const owned = await User.findById(req.user);

    if (driver.driverName.toString() !== owned._id.toString()) {
      return res.json({ msg: "Access is denied." });
    }


    if (!req.files || Object.keys(req.files).length === 0) {
        return res.json({ msg: "No files were uploaded." });
      }
  
      const driverCarPhoto = req.files.driverCarPhoto;
  
      if (!driverCarPhoto) {
        return res.json({ msg: "No image was selected." });
      }
  
      const result = await cloudinary.uploader.upload(driverCarPhoto.tempFilePath);


      await Driver.findByIdAndUpdate(id, { driverCarPhoto: result.secure_url });
      
      res.json({ msg: " successfully updated." });
  


      


    
} catch (error) {
    res.json({msg: `there was a problem while updating the car photo: ${error.message}`})
}

}))


module.exports = DriverInfoRoute