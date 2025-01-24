const DriverTaxiRoute = require('express').Router()
const TaxiRoute = require('../models/TaxiRouteModel')
const Driver = require('../models/DriverModel')
const User = require('../models/UserModel')
const Ride = require('../models/RideModel')
const SharedTaxiBooking = require('../models/SharedTaxiBooking')
const verify = require('../middleware/verify')
const verifyDriver = require('../middleware/verifyDriver')



DriverTaxiRoute.put(
  '/driver_start_trip_non_shared/:tripId/:driverId',
  verify,
  verifyDriver,
  async (req, res) => {
    try {
      const { tripId, driverId } = req.params;

      // Check if the driver exists in the Ride collection
      const ride = await Ride.findOne({ _id: tripId, driverId: driverId });

      if (!ride) {
        return res.status(404).json({ msg: "Ride or driver does not exist" });
      }

      // Ensure the rideStatus is appropriate for starting a trip
      if (ride.rideStatus !== 'requested') {
        return res.status(400).json({
          msg: `Ride status is '${ride.rideStatus}' and cannot be started.`,
        });
      }

      // Update the ride status to "in transit"
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
    
    const { taxiId, routeName, startLocation, endLocation, fare } = req.body;

    // Validate data
    if (!taxiId || !routeName || !startLocation || !endLocation || !fare) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Validate that startLocation and endLocation have coordinates and placeName
    if (
      !startLocation.coordinates || !Array.isArray(startLocation.coordinates.coordinates) ||
      startLocation.coordinates.coordinates.length !== 2 ||
      !startLocation.placeName ||
      !endLocation.coordinates || !Array.isArray(endLocation.coordinates.coordinates) ||
      endLocation.coordinates.coordinates.length !== 2 ||
      !endLocation.placeName
    ) {
      return res.status(400).json({ success: false, message: 'Invalid location data' });
    }

    // Create a new TaxiRoute document
    const route = new TaxiRoute({
      taxiId,
      routeName,
      startLocation,
      endLocation,
      fare,
    });


  

    // Save the route
    await route.save();

    // Respond with success message and created route data
    res.status(201).json({ success: true, message: 'Route created successfully', route });
  } catch (error) {
    console.error('Error in backend:', error);  // Log the error
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



  DriverTaxiRoute.get('/driver_see_my_routes/:id', verify, verifyDriver, async(req, res) => {


    try {
        const {id} = req.params

        const driver = await Driver.findOne({driverName: id})

        const myRoutes = await TaxiRoute.find({taxiId: driver._id})

        res.json(myRoutes)
        
    } catch (error) {

        res.status(500).json({ success: false, message: error.message });
        
    }

  })


  // de-boarding passenger(s)

  DriverTaxiRoute.get('/show_boarded_taxi_to_owner/:id', verify, verifyDriver,   async (req, res) => {
    try {
      const { id } = req.params;
  
      // Check if the driver exists
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
  
      // Find the driver by their name
      const driver = await Driver.findOne({ driverName: id });
      if (!driver) {
        return res.status(404).json({ msg: "Driver not found" });
      }
  
      // Verify ownership
      const owned = await User.findById(req.user);
      if (!owned || driver.driverName.toString() !== owned._id.toString()) {
        return res.status(403).json({ msg: "Access is denied." });
      }
  
      // Check for passengers linked to the driver
      const passenger = await Ride.findOne({ driverId: driver._id });
      if (!passenger) {
        return res.status(404).json({ msg: "No passenger has boarded this taxi." });
      }
  
      // Delete the ride record to deboard the passenger
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
  
      // Find the SharedTaxiBooking document and update it
      const updatedTaxiBooking = await SharedTaxiBooking.findOneAndUpdate(
        { driverId }, // Match the taxi by driverId
        { $pull: { bookings: { userId } } }, // Remove the booking with the specified userId
        { new: true } // Return the updated document
      );
  
      // Check if the document was found and updated
      if (!updatedTaxiBooking) {
        return res.status(404).json({ msg: 'No shared taxi booking found for the provided driverId.' });
      }
  
      res.status(200).json({
        msg: `Passenger  was successfully deboarded.`,
        updatedTaxiBooking,
      });
    } catch (error) {
      res.status(500).json({ msg: `There was an error: ${error.message}` });
    }
  });


  // driver update route

  DriverTaxiRoute.put('/driver_route_update/:id', verify, verifyDriver, async(req, res) => {
    try {
      const {id} = req.params
  
      const ownerId = await TaxiRoute.findById(id)
      if (!ownerId) {
        return res.status(404).json({msg: "Route not found"})
      }

      console.log("owner", ownerId)
  
      const findDriver = await Driver.findById(ownerId.taxiId)
      if (!findDriver) {
        return res.status(404).json({msg: "Driver not found"})
      }

      console.log("find driver", findDriver)
      console.log("req user", req.user.id)

    
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
  
 
  module.exports = DriverTaxiRoute
  
  
