const TaxiRoutePublic = require('express').Router()
const TaxiRoute = require("../models/TaxiRouteModel");
const Ride = require('../models/RideModel')
const verify = require('../middleware/verify')
const ConfirmationCode = require('../models/TaxiConfirmationModel')




TaxiRoutePublic.get('/taxi_route/:id',  async(req, res) => {


    try {
        const {id} = req.params

        const myRoutes = await TaxiRoute.find({taxiId: id})

        res.json(myRoutes)
        
    } catch (error) {

        res.status(500).json({ success: false, message: error.message });
        
    }

  })


  TaxiRoutePublic.get('/book_taxi', verify, async(req, res) => {


    try {

        const {userId, driverId, pickupLocation, dropoffLocation} = req.body

        if(!userId || !driverId || !pickupLocation || !dropoffLocation ) {
            return res.json({msg: "fields cannot be empty"})
        }

        
        
    } catch (error) {

        res.status(500).json({ success: false, message: error.message });
        
    }


  })



  const generateConfirmationCode = () => {
    // Generate a random 6-character alphanumeric confirmation code
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

TaxiRoutePublic.post('/book_taxi', verify, async (req, res) => {
    try {
        const { userId, driverId, pickupLocation, dropoffLocation, fare } = req.body;

        // Check if required fields are present
        if (!userId || !driverId || !pickupLocation || !dropoffLocation || !fare) {
            return res.status(400).json({ msg: "Fields cannot be empty" });
        }

        // Step 1: Create a new Ride entry
        const newRide = new Ride({
            userId,
            driverId,
            pickupLocation,
            dropoffLocation,
            fare,
        });

        const savedRide = await newRide.save();

        // Step 2: Generate a unique confirmation code
        const confirmationCode = generateConfirmationCode();

        // Step 3: Create a ConfirmationCode entry
        const newConfirmation = new ConfirmationCode({
            confirmationCode,
            rideStatus: 'requested', // Initial status
            taxiName: savedRide._id, // Link to the created ride
        });

        const savedConfirmation = await newConfirmation.save();

        // Respond with success and booking details
        res.status(201).json({
            success: true,
            message: 'Taxi booked successfully!',
            rideDetails: savedRide,
            confirmationDetails: savedConfirmation,
        });
    } catch (error) {
        console.error('Error booking taxi:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});




  module.exports = TaxiRoutePublic