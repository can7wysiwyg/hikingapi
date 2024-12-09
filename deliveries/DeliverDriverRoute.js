const DeliverDriverRoute = require('express').Router()
const Delivery = require('../models/DeliveryCarModel')
const verify = require('../middleware/verify')
const verifyDriver = require('../middleware/verifyDriver')
const asyncHandler = require('express-async-handler')
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});



DeliverDriverRoute.post('/upload_delivery_car', verify, verifyDriver, asyncHandler(async(req, res) => {


    try {

        const checkUser = await Delivery.findOne({owner: req.user.id})

        if(checkUser) {
            return res.json({msg: "Your Details Exist!"})
        }

        const {loadWeight, packageSize, vehicleType } = req.body

         if(!loadWeight) {
            return res.json({msg: "load weight field cannot be empty"})
         }

         if(!packageSize) {
            return res.json({msg: "package size field cannot be empty"})
         }

         if(!vehicleType) {
            return res.json({msg: "package size field cannot be empty"})

         }


         if (!req.files || !req.files.deliveryCarPhoto) {
            return res.json({ msg: "your car Photo is required." });
          }
    

      const delivery = await Delivery({
        vehicleType,
        packageSize,
        loadWeight,
        owner: req.user.id


      })    

      const deliveryCarPhoto =  req.files.deliveryCarPhoto


      const result = await cloudinary.uploader.upload(
        deliveryCarPhoto.tempFilePath
      );

      delivery.deliveryCarPhoto = result.secure_url;

      await delivery.save();


      res.json({msg: "succesfully uploaded your delivery car!"})




        
    } catch (error) {
        res.json({msg: `there was a problem while perfoming this action ${error.message}`})
    }



}))




module.exports = DeliverDriverRoute