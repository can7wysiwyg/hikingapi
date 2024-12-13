const DeliverPublicRoute = require('express').Router()
const Delivery = require('../models/DeliveryCarModel')
const asyncHandler = require('express-async-handler')
const User = require('../models/UserModel')

DeliverPublicRoute.get('/show_deliver_cars', asyncHandler(async(req, res) => {


    try {

        const cars = await Delivery.find().sort({_id: -1})

        res.json({cars})
        
    } catch (error) {
        res.json({msg: `there was a problem while displaying this data: ${error.message}`})
    }

}))


DeliverPublicRoute.get('/get_single_deliverer/:id', asyncHandler(async(req, res) => {

    try {

        const {id} = req.params

        const driver = await Delivery.findOne({driverName: id});


        if (!driver) {
            return res.status(404).json({ msg: 'Driver not found' });
          }
    
          
          const user = await User.findById(driver.driverName); 
    
          if (!user) {
            return res.status(404).json({ msg: 'User not found for this driver' });
          }


          const driverDetails = {
            userPhoto: user.userPhoto,
             fullname: user.fullname,
             userId: user._id,
        
             userLocation: user.userLocation,
             vehicleType: driver.vehicleType,
             loadWeight: driver.loadWeight,
             deliveryCarPhoto: driver.deliveryCarPhoto,
             driverId: driver._id,
             driverName: driver.driverName,
             packageSize: driver.packageSize
           
           };
     
           
           res.json(driverDetails);
    




        
    } catch (error) {

      res.json({msg: `there was a  an error while performing this action ${error.message}`})
        
    }



}))


DeliverPublicRoute.get('/delivery_car_single/:id', asyncHandler(async(req, res) => {

  try {

    const {id}  = req.params

    const driver = await Delivery.findById(id);


        if (!driver) {
            return res.status(404).json({ msg: 'Driver not found' });
          }
    
          
          const user = await User.findById(driver.driverName); 
    
          if (!user) {
            return res.status(404).json({ msg: 'User not found for this driver' });
          }


          const driverDetails = {
            userPhoto: user.userPhoto,
             fullname: user.fullname,
             userId: user._id,
        
             userLocation: user.userLocation,
             vehicleType: driver.vehicleType,
             loadWeight: driver.loadWeight,
             deliveryCarPhoto: driver.deliveryCarPhoto,
             driverId: driver._id,
             driverName: driver.driverName,
             packageSize: driver.packageSize
           
           };
     
           
           res.json(driverDetails);
    




    
  } catch (error) {

    res.json({msg: `there was a  an error while performing this action ${error.message}`})
     
    
  }


}))


DeliverPublicRoute.get('/by_parcel_size', asyncHandler(async(req, res) => {

  try {
    
    const packageSizeEnums = await Delivery.schema.path('packageSize').options.enum

    res.json({packageSizeEnums})


    
  } catch (error) {
    res.json({msg: `there was an error: ${error.message}`})
  }


}))


module.exports = DeliverPublicRoute
