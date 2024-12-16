const TaxiRoutePublic = require('express').Router()
const TaxiRoute = require("../models/TaxiRouteModel");
const Ride = require('../models/RideModel')
const verify = require('../middleware/verify')
const ConfirmationCode = require('../models/TaxiConfirmationModel')
const Driver = require('../models/DriverModel')
const SharedTaxiBooking = require('../models/SharedTaxiBooking')



TaxiRoutePublic.get('/taxi_route/:id',  async(req, res) => {


    try {
        const {id} = req.params

        const myRoutes = await TaxiRoute.find({taxiId: id})

        res.json(myRoutes)
        
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

        // Step 1: Fetch the driver details to check taxi type
        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({ msg: "Driver not found" });
        }

        if (driver.taxiType === 'shared') {
            // Shared taxi logic
            const sharedTaxiCapacity = parseInt(driver.driverCarCapacity, 10);

            // Fetch or create a shared taxi entry in SharedTaxiBooking model
            let sharedTaxiBooking = await SharedTaxiBooking.findOne({ driverId });
            if (!sharedTaxiBooking) {
                sharedTaxiBooking = new SharedTaxiBooking({
                    driverId,
                    taxiCapacity: sharedTaxiCapacity,
                    bookings: [], // Initialize an empty array for confirmation codes
                });
            }

            // Check if the taxi has reached its capacity
            if (sharedTaxiBooking.bookings.length >= sharedTaxiCapacity) {
                return res.status(400).json({ msg: "Taxi is fully booked" });
            }

            // Generate a unique confirmation code
            const confirmationCode = generateConfirmationCode();

            // Add the new booking to the shared taxi's confirmation codes array
            sharedTaxiBooking.bookings.push({
                confirmationCode,
                userId,
            });

            await sharedTaxiBooking.save();

            return res.status(201).json({
                success: true,
                message: 'Taxi booked successfully!',
                confirmationCode,
                currentOccupancy: sharedTaxiBooking.bookings.length,
                maxCapacity: sharedTaxiCapacity,
            });
        } else {
            // Non-shared taxi logic (normal ride booking)
            const newRide = new Ride({
                userId,
                driverId,
                pickupLocation,
                dropoffLocation,
                fare,
            });

            const savedRide = await newRide.save();

            const confirmationCode = generateConfirmationCode();

            const newConfirmation = new ConfirmationCode({
                confirmationCode,
                rideStatus: 'requested',
                taxiName: savedRide._id,
            });

            const savedConfirmation = await newConfirmation.save();

            return res.status(201).json({
                success: true,
                message: 'Taxi booked successfully!',
                rideDetails: savedRide,
                confirmationDetails: savedConfirmation,
            });
        }
    } catch (error) {
        console.error('Error booking taxi:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});




TaxiRoutePublic.get('/taxi_occupancy/:driverId', verify, async (req, res) => {
    try {
        const { driverId } = req.params;  // Extract driverId from URL parameters

        
        // Fetch the shared taxi booking entry using the driverId
        const sharedTaxi = await SharedTaxiBooking.findOne({ driverId });
        
        if (!sharedTaxi) {
            // If no shared taxi booking exists, return 200 with no bookings and the driver's capacity
            const driver = await Driver.findById(driverId);
            if (!driver) {
                return res.status(404).json({ msg: "Driver not found" });
            }
            const maxCapacity = parseInt(driver.driverCarCapacity, 10);  // Get the driver's taxi capacity

            return res.status(200).json({
                success: true,
                currentOccupancy: 0,  // No bookings yet
                maxCapacity,          // Include driver's capacity
                message: "Taxi is available, waiting for passengers."
            });
        }

        // Get the current number of bookings (length of bookings array)
        const currentOccupancy = sharedTaxi.bookings.length;

        // Get the maximum capacity of the taxi (from the driver model)
        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({ msg: "Driver not found" });
        }

        const maxCapacity = parseInt(driver.driverCarCapacity, 10);  // Get the driver's taxi capacity

        // Send the current occupancy, max capacity, and driver's capacity as response
        res.status(200).json({
            success: true,
            currentOccupancy,
            maxCapacity,           // Send the maxCapacity as part of the response
        });
    } catch (error) {
        console.error('Error fetching taxi occupancy:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});




TaxiRoutePublic.get('/taxi_occupancy_all',  async (req, res) => {
    try {
      const sharedTaxis = await SharedTaxiBooking.find().populate('driverId', 'name').populate('bookings.userId', 'name');
  
      
      const sharedTaxisWithStatus = sharedTaxis.map((taxi) => ({
        id: taxi._id,
        driverId: taxi.driverId,
        taxiCapacity: taxi.taxiCapacity,
        currentOccupancy: taxi.bookings.length,
        isFull: taxi.bookings.length >= taxi.taxiCapacity,
        bookings: taxi.bookings,
      }));
  
      res.json({ sharedTaxis: sharedTaxisWithStatus });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
  
  TaxiRoutePublic.get('/check_if_user_booked/:driverId/:userId', async(req, res) => {

    try {

        const {driverId, userId} = req.params

        const sharedTaxi = await SharedTaxiBooking.findOne({ driverId });

        if (!sharedTaxi) {
          return res.status(404).json({ msg: "Shared taxi not found" });
        }
    
        // Check if the user already has a booking
        const userAlreadyBooked = sharedTaxi.bookings.some(booking => booking.userId.toString() === userId);

        res.json({userAlreadyBooked})
    

        



        
    } catch (error) {

        res.status(500).json({ success: false, message: error.message });
        
    }


  })


  module.exports = TaxiRoutePublic