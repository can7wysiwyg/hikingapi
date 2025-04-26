const DriverTaxiRoute = require('express').Router()
const TaxiRoute = require('../models/TaxiRouteModel')
const Driver = require('../models/DriverModel')
const User = require('../models/UserModel')
const Ride = require('../models/RideModel')
const SharedTaxiBooking = require('../models/SharedTaxiBooking')
const verify = require('../middleware/verify')
const verifyDriver = require('../middleware/verifyDriver')
const TripCount = require('../models/TripCountModel')



DriverTaxiRoute.put(
  '/driver_start_trip_non_shared/:tripId/:driverId',
  verify,
  verifyDriver,
  async (req, res) => {
    try {
      const { tripId, driverId } = req.params;

  
      const ride = await Ride.findOne({ _id: tripId, driverId: driverId });

      if (!ride) {
        return res.status(404).json({ msg: "Ride or driver does not exist" });
      }

    
      if (ride.rideStatus !== 'requested') {
        return res.status(400).json({
          msg: `Ride status is '${ride.rideStatus}' and cannot be started.`,
        });
      }

      
      ride.rideStatus = 'in transit';
      await ride.save();

      res.status(200).json({
        msg: "Ride status updated to 'in transit'",
        updatedRide: ride,
      });
    } catch (error) {
      console.error('Error starting trip:', error.message);
      res.status(500).json({ msg: `There was a problem: ${error.message}` });
    }
  }
);






DriverTaxiRoute.post('/driver/routes', verify, verifyDriver, async (req, res) => {
  try {
    
    const alreadyExists = await Driver.findOne({ driverName: req.user.id });
    const found = alreadyExists._id;
    const checkTaxi = await TaxiRoute.findOne({ taxiId: found });
    if (checkTaxi) {
      return res.json({ msg: "You have a route already" });
    }

    const { taxiId, isLongDistance, routeName, destinationArea, startLocation, endLocation, fare } = req.body;
    
  
    if (!taxiId || !fare) {
      return res.status(400).json({ success: false, message: 'Taxi ID, route name, and fare are required' });
    }

    
    const routeData = {
      taxiId,
      routeName,
      fare
    };

  
    if (!isLongDistance) {
      
      if (!startLocation || !endLocation ) {
        return res.status(400).json({ 
          success: false, 
          message: 'Start location and end location are required for long-distance routes' 
        });
      }

      
      if (
        !startLocation.coordinates || !Array.isArray(startLocation.coordinates.coordinates) ||
        startLocation.coordinates.coordinates.length !== 2 || !startLocation.placeName ||
        !endLocation.coordinates || !Array.isArray(endLocation.coordinates.coordinates) ||
        endLocation.coordinates.coordinates.length !== 2 || !endLocation.placeName
      ) {
        return res.status(400).json({ success: false, message: 'Invalid location data' });
      }

    
      routeData.startLocation = startLocation;
      routeData.endLocation = endLocation;
    } 
    
    else {
      
      if (!destinationArea) {
        return res.status(400).json({ 
          success: false, 
          message: 'Destination area is required for local routes' 
        });
      }

      
      routeData.destinationArea = destinationArea;
    }

    const route = new TaxiRoute(routeData);
    await route.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Route created successfully', 
      route 
    });
  } catch (error) {
    console.error('Error in backend:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



  DriverTaxiRoute.get('/driver_see_my_routes/:id', async(req, res) => {


    try {
        const {id} = req.params

        const driver = await Driver.findOne({driverName: id})

        const myRoutes = await TaxiRoute.find({taxiId: driver._id})

        res.json(myRoutes)
        
    } catch (error) {

        res.status(500).json({ success: false, message: error.message });
        
    }

  })




  DriverTaxiRoute.get('/show_boarded_taxi_to_owner/:id', verify, verifyDriver,   async (req, res) => {
    try {
      const { id } = req.params;
  
      
      const driverExists = await Driver.findOne({ driverName: id });
      if (!driverExists) {
        return res.status(404).json({ msg: "Driver does not exist" });
      }

      const driverId = driverExists._id;

      if(driverExists.taxiType === "non-shared") {
        const nonSharedTaxi = await Ride.findOne({ driverId });
        res.status(200).json({passengers: nonSharedTaxi });

        

      } else if( driverExists.taxiType === "shared"){
        const sharedTaxi = await SharedTaxiBooking.findOne({ driverId });
        
        res.status(200).json({passengers: sharedTaxi });
        

      } else{
        res.status(404).json({ msg: "No passengers boarded this taxi" });

      }

  
     
        
  
    } catch (error) {
      console.error("Error fetching taxi details:", error);
      res.status(500).json({ msg: `There was a problem: ${error.message}` });
    }
  });
  


  DriverTaxiRoute.delete('/de_board_passenger_from_non_shared_taxi/:id', verify, verifyDriver, async (req, res) => {
    try {
      const { id } = req.params;
  
      
      const driver = await Driver.findOne({ driverName: id });
      if (!driver) {
        return res.status(404).json({ msg: "Driver not found" });
      }
  
    
      const owned = await User.findById(req.user);
      if (!owned || driver.driverName.toString() !== owned._id.toString()) {
        return res.status(403).json({ msg: "Access is denied." });
      }
  
    
      const passenger = await Ride.findOne({ driverId: driver._id });
      if (!passenger) {
        return res.status(404).json({ msg: "No passenger has boarded this taxi." });
      }
  
      
      await Ride.deleteOne({ driverId: driver._id });
  
      res.status(200).json({
        msg: "Passenger successfully deboarded. Taxi is now available.",
      });
    } catch (error) {
      console.error("Error deboarding passenger:", error);
      res.status(500).json({ msg: `There was a problem: ${error.message}` });
    }
  });




  DriverTaxiRoute.delete('/de_board_passenger_from_non_shared_taxi_and_count/:id', verify, verifyDriver, async (req, res) => {
    try {
      const { id } = req.params;
  
      
      const driver = await Driver.findOne({ driverName: id });
      if (!driver) {
        return res.status(404).json({ msg: "Driver not found" });
      }
  
      
      const owned = await User.findById(req.user);
      if (!owned || driver.driverName.toString() !== owned._id.toString()) {
        return res.status(403).json({ msg: "Access is denied." });
      }
  
      
      const passenger = await Ride.findOne({ driverId: driver._id });
      if (!passenger) {
        return res.status(404).json({ msg: "No passenger has boarded this taxi." });
      }
  

      const tripId = await TripCount.findOne({owner: driver._id})

      if (!tripId) {
      
        const newTrip = new TripCount({
          owner: driver._id,
          tripNumber: 1  
        });

        
        await newTrip.save();
      } else {
        
        await TripCount.findByIdAndUpdate(
          tripId._id,
          { $inc: { tripNumber: 1 } },
          { new: true }
        );
      }

      await Ride.deleteOne({ driverId: driver._id });
  
      res.status(200).json({
        msg: "Passenger successfully deboarded. Taxi is now available.",
      });
    } catch (error) {
      console.error("Error deboarding passenger:", error);
      res.status(500).json({ msg: `There was a problem: ${error.message}` });
    }
  });





  
  DriverTaxiRoute.delete('/de_board_from_shared_taxi/:userId/:driverId', verify, verifyDriver, async (req, res) => {
    try {

      const { userId, driverId } = req.params;
  
      
      const updatedTaxiBooking = await SharedTaxiBooking.findOneAndUpdate(
        { driverId }, 
        { $pull: { bookings: { userId } } }, 
        { new: true } 
      );
  
      //
      if (!updatedTaxiBooking) {
        return res.status(404).json({ msg: 'No shared taxi booking found for the provided driverId.' });
      }
  
      
      if (updatedTaxiBooking.bookings.length === 0) {
        
        const tripId = await TripCount.findOne({ owner: driverId });
  
        if (!tripId) {
        
          const newTrip = new TripCount({
            owner: driverId,
            tripNumber: 1
          });
          await newTrip.save();
        } else {
          
          await TripCount.findByIdAndUpdate(
            tripId._id,
            { $inc: { tripNumber: 1 } },
            { new: true }
          );
        }
      }
  
      
      res.status(200).json({
        msg: `Passenger was successfully deboarded.`,
        updatedTaxiBooking,
      });
     
    } catch (error) {
      res.status(500).json({ msg: `There was an error: ${error.message}` });
    }
  });




  DriverTaxiRoute.put('/driver_route_update/:id', verify, verifyDriver, async(req, res) => {
    try {
      const {id} = req.params
  
      const ownerId = await TaxiRoute.findById(id)
      if (!ownerId) {
        return res.status(404).json({msg: "Route not found"})
      }

      
  
      const findDriver = await Driver.findById(ownerId.taxiId)
      if (!findDriver) {
        return res.status(404).json({msg: "Driver not found"})
      }

      
    
      if(findDriver.driverName.toString() !== req.user.id) {
        return res.status(403).json({msg: "Unauthorized to update this route"})
      }
  
      const updatedRoute = await TaxiRoute.findByIdAndUpdate(
        id, 
        req.body, 
        {new: true}
      )
  
      res.json({msg: "successfully updated", route: updatedRoute})
  
    } catch (error) {
      res.status(500).json({msg: `Problem updating: ${error.message}`})
    }
  })



  DriverTaxiRoute.delete('/driver_erase_my_route/:id', verify, verifyDriver, async(req, res) => {

    try {
      const {id} = req.params

      const findDriver = await Driver.findOne({driverName: id})

      
      if(!findDriver) {
        return res.json({msg: "there was a problem"})
      }

      const TaxiId = findDriver._id

    

      const taxiId  = await TaxiRoute.findOne({taxiId: TaxiId})
  

      const routeId = taxiId?._id

      
       await TaxiRoute.findByIdAndDelete(routeId)

      res.json({msg: `Successfully deleted..`})
      
    } catch (error) {
      console.log(`problem with deleting the route: ${error}`)
      res.json({msg: `problem with deleting the route: ${error}`})
    }


  })
  
 
  module.exports = DriverTaxiRoute
  
  
