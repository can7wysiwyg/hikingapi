const DriverInfoRoute = require("express").Router();
const User = require("../models/UserModel");
const Driver = require("../models/DriverModel");
const asyncHandler = require("express-async-handler");
const verify = require("../middleware/verify");
const verifyDriver = require('../middleware/verifyDriver')
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});


DriverInfoRoute.post(
  "/driver_info_create",
  verify,
  verifyDriver,
  asyncHandler(async (req, res) => {
    try {
      // Check if driver already exists
      const alreadyExists = await Driver.findOne({ driverName: req.user.id });

      if (alreadyExists) {
        return res.json({ msg: "Action not possible! You are already registered!" });
      }

      // Destructure fields from the request body
      const { driverCarPlate, driverCarCapacity, vehicleType, taxiType } = req.body;

      // Validate required fields
      if (!driverCarPlate) {
        return res.json({ msg: "Car number plate cannot be empty" });
      }

      if (!driverCarCapacity) {
        return res.json({
          msg: "You should specify the number of people your car carries",
        });
      }

      if (!vehicleType || !["bus", "taxi"].includes(vehicleType.toLowerCase())) {
        return res.json({ msg: "Invalid vehicle type. Must be 'bus' or 'taxi'." });
      }

      if (!taxiType) {
        return res.json({ msg: "Taxi type cannot be empty" });
      }

      // Validate photo fields
      if (
        !req.files ||
        !req.files.driverCarPhoto ||
        !req.files.drivingLicence ||
        !req.files.idPhotoFront ||
        !req.files.idPhotoBack
      ) {
        return res.json({ msg: "All photos (Car Photo, Driving Licence, ID Front, ID Back) are required." });
      }

      // Create a new driver object
      const driver = new Driver({
        driverCarCapacity,
        driverCarPlate,
        driverName: req.user.id,
        vehicleType: vehicleType.toLowerCase(),
        taxiType,
      });

      // Upload all photos to Cloudinary
      const uploadToCloudinary = async (file) => {
        const result = await cloudinary.uploader.upload(file.tempFilePath);
        return result.secure_url;
      };

      driver.driverCarPhoto = await uploadToCloudinary(req.files.driverCarPhoto);
      driver.drivingLicence = await uploadToCloudinary(req.files.drivingLicence);
      driver.idPhotoFront = await uploadToCloudinary(req.files.idPhotoFront);
      driver.idPhotoBack = await uploadToCloudinary(req.files.idPhotoBack);

      // Save the driver object
      await driver.save();

      res.json({ msg: "We Will Get Back To You..." });
    } catch (error) {
      res.json({
        msg: `There was a problem updating driver information: ${error.message}`,
      });
    }
  })
);




DriverInfoRoute.put(
  "/driver_car_photo_update/:id",
  verify,
  verifyDriver,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
       const driver = await Driver.findOne({driverName: id});

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

      const result = await cloudinary.uploader.upload(
        driverCarPhoto.tempFilePath
      );

     
      await Driver.findByIdAndUpdate(driver._id, { driverCarPhoto: result.secure_url });

      res.json({ msg: " successfully updated." });
    } catch (error) {
      res.json({
        msg: `there was a problem while updating the car photo: ${error}`,
      });
    }
  })
);

DriverInfoRoute.put(
  "/driver_car_info_update/:id",
  verify,
  verifyDriver,
  asyncHandler(async (req, res) => {

try {

  const {id} = req.params
  const driver = await Driver.findOne({driverName: id});

      const owned = await User.findById(req.user);

      if (driver.driverName.toString() !== owned._id.toString()) {
        return res.json({ msg: "Access is denied." });
      }

      await Driver.findByIdAndUpdate(driver, req.body, {new: true})

        res.json({msg: "successfully updated!"})
    

  
} catch (error) {
  res.json({msg: `there was an error: ${error.message}`})
}


  })
);

module.exports = DriverInfoRoute;
