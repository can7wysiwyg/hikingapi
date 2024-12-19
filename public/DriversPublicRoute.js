const DriversPublicRoute = require('express').Router()
const User = require('../models/UserModel')
const Driver = require('../models/DriverModel')
const asyncHandler = require('express-async-handler')


DriversPublicRoute.get('/taxis_show_all', asyncHandler(async(req, res) => {
  

    try {

    
        const  taxis = await Driver.find();  
      
      res.json({ taxis });

        
        
    } catch (error) {
        res.json({msg: `there was an error while fetching users: ${error.message}`})
    }

}))


DriversPublicRoute.get('/drivers_show_all', asyncHandler(async(req, res) => {

    try {

        const drivers = await User.find({role: 11}).select("_id fullname userPhoto")

        res.json({drivers})

        
    } catch (error) {
        res.json({msg: `there was an error while fetching users: ${error.message}`})
    }

}))


DriversPublicRoute.get(
    '/single_driver/:id',
    asyncHandler(async (req, res) => {
      try {
        const { id } = req.params;
  
        // Fetch the driver details using the `Driver` model
        const driver = await Driver.findOne({driverName: id});
  
        if (!driver) {
          return res.status(404).json({ msg: 'Driver not found' });
        }
  
        // Fetch user details using the associated User ID
        const user = await User.findById(driver.driverName); // Replace `userId` with the correct field in the Driver model linking to the User model
  
        if (!user) {
          return res.status(404).json({ msg: 'User not found for this driver' });
        }
  
        
        const driverDetails = {
         userPhoto: user.userPhoto,
          fullname: user.fullname,
          phone: user.phone,
          email: user.email,
          userLocation: user.userLocation,
          driverCarPlate: driver.driverCarPlate,
          driverCarCapacity: driver.driverCarCapacity,
          driverCarPhoto: driver.driverCarPhoto,
          driverId: driver._id,
          vehicleType: driver.vehicleType,
          taxiType: driver.taxiType
        
        };
  
        // Respond with the combined driver details
        res.json(driverDetails);
      } catch (error) {
        res.status(500).json({
          msg: `There was an error while fetching the driver: ${error.message}`,
        });
      }
    })
  );
  

 
DriversPublicRoute.get('/taxi_single/:id', asyncHandler(async(req, res) => {

    try {

        const {id} = req.params

        const taxi = await Driver.findById(id)

      

        const user = await User.findById(taxi.driverName)

        


        if (!user) {
          return res.status(404).json({ msg: 'User not found for this driver' });
        }
  
        
        const driverDetails = {
         userPhoto: user.userPhoto,
          fullname: user.fullname,
          phone: user.phone,
          email: user.email,
          personId: user._id,
          userLocation: user.userLocation,
          driverCarPlate: taxi.driverCarPlate,
          driverCarCapacity: taxi.driverCarCapacity,
          driverCarPhoto: taxi.driverCarPhoto,
           driverName: taxi.driverName,
          driverId: taxi._id,
          vehicleType: taxi.vehicleType,
          taxiType: taxi.taxiType
        
        };
  
        // Respond with the combined driver details
        res.json(driverDetails);





        
        
    } catch (error) {
        res.json({msg: `there was an error: ${error.message}`})
    }


}))  


DriversPublicRoute.get('/taxi_type_enum', asyncHandler(async(req, res) => {

try {

  const taxiTypeEnums = await Driver.schema.path('taxiType').options.enum

    res.json({taxiTypeEnums})

  
} catch (error) {
  res.json({msg: `there was a problem while loading this info ${error.message}`})
}


}))

module.exports = DriversPublicRoute
