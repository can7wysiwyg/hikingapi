const DriverTaxiRoute = require('express').Router()
const TaxiRoute = require('../models/TaxiRouteModel')
const Driver = require('../models/DriverModel')
const User = require('../models/UserModel')
const Ride = require('../models/RideModel')
const SharedTaxiBooking = require('../models/SharedTaxiBooking')
const verify = require('../middleware/verify')
const verifyDriver = require('../middleware/verifyDriver')

DriverTaxiRoute.post('/driver/routes', verify, verifyDriver, async (req, res) => {
    try {
      const { taxiId, routeName, startLocation, endLocation, fare } = req.body;
  
      // Validate data
      if (!taxiId || !routeName || !startLocation || !endLocation || !fare) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
      }
  
      const route = new TaxiRoute({
        taxiId,
        routeName,
        startLocation,
        endLocation,
        fare,
      });
  
      await route.save();
      res.status(201).json({ success: true, message: 'Route created successfully', route });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
  
  

  // DriverTaxiRoute.put('/driver/routes/:id', verify, verifyDriver, async (req, res) => {
  //   try {
  //     const route = await TaxiRoute.findOneAndUpdate(
  //       { _id: req.params.id, taxiId: req.body.taxiId },
  //       req.body,
  //       { new: true }
  //     );
  
  //     if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
  
  //     res.status(200).json({ success: true, message: 'Route updated successfully', route });
  //   } catch (error) {
  //     res.status(500).json({ success: false, message: error.message });
  //   }
  // });


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

  DriverTaxiRoute.get('/show_boarded_taxi_to_owner/:id', verify, verifyDriver, async (req, res) => {
    try {
      const { id } = req.params;
  
      // Check if the driver exists
      const driverExists = await Driver.findOne({ driverName: id });
      if (!driverExists) {
        return res.status(404).json({ msg: "Driver does not exist" });
      }
  
      const driverId = driverExists._id;
  
      // Check for non-shared taxi (Ride model)
      const nonSharedTaxi = await Ride.findOne({ driverId });
      if (nonSharedTaxi) {
        // Return the non-shared taxi details
        return res.status(200).json({passengers: nonSharedTaxi });
      }
  
      // Check for shared taxi (SharedTaxiBooking model)
      const sharedTaxi = await SharedTaxiBooking.findOne({ driverId });
      if (sharedTaxi) {
        // Return the shared taxi details
        return res.status(200).json({passengers: sharedTaxi.passengers });
      }
  
      // If neither non-shared nor shared taxi is found
      return res.status(404).json({ msg: "No passengers boarded this taxi" });
  
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
  
  

  module.exports = DriverTaxiRoute
  
  
