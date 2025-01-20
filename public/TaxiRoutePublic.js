const TaxiRoutePublic = require('express').Router()
const TaxiRoute = require("../models/TaxiRouteModel");
const Ride = require('../models/RideModel')
const verify = require('../middleware/verify')
const ConfirmationCode = require('../models/TaxiConfirmationModel')
const Driver = require('../models/DriverModel')
const SharedTaxiBooking = require('../models/SharedTaxiBooking')
const NotificationTaxiServices = require('../notifications/NotificationTaxiServices')
const User = require('../models/UserModel');
const SharedTaxiNotificationServices = require('../notifications/SharedTaxiNotificationBooking');




TaxiRoutePublic.get('/taxi_route/:id',  async(req, res) => {


    try {
        const {id} = req.params

        const myRoutes = await TaxiRoute.find({taxiId: id})

        res.json(myRoutes)
        
    } catch (error) {

        res.status(500).json({ success: false, message: error.message });
        
    }

  })


    
     
  TaxiRoutePublic.get('/show_taxis_by_coordinates', async (req, res) => {
    try {
      const { userLongitude, userLatitude, destLongitude, destLatitude } = req.query;
  
      if (!userLongitude || !userLatitude || !destLongitude || !destLatitude) {
        return res.status(400).json({ error: 'All coordinates (user and destination) are required.' });
      }
  
      
      const userMaxDistance = 800; // 200 meters
const destMaxDistance = 300; // 300 meters

      
  
      // Step 1: Find shared taxis near the user
      const nearbySharedTaxis = await Driver.find({
        taxiType: 'shared', // Only shared taxis
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(userLongitude), parseFloat(userLatitude)], // User's current location
            },
            $maxDistance: userMaxDistance,
          },
        },
      });
  
      
      // Step 2: Filter for taxis heading to the destination
      const filteredSharedTaxis = [];
      for (const taxi of nearbySharedTaxis) {
        const matchingRoute = await TaxiRoute.findOne({
          taxiId: taxi._id, // Match the taxi to its route
          'endLocation.coordinates': {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [parseFloat(destLongitude), parseFloat(destLatitude)], // Destination coordinates
              },
              $maxDistance: destMaxDistance,
            },
          },
        });
  
        if (matchingRoute) {
          filteredSharedTaxis.push({
            driver: taxi,
            route: matchingRoute,
          });
        }
      }
  
      
      // Return filtered taxis
      if (!filteredSharedTaxis.length) {
        return res.json({ sharedTaxis: [], message: 'No shared taxis match your search criteria.' });
      }
  
      res.json({ sharedTaxis: filteredSharedTaxis });
    } catch (error) {
      console.error('Error fetching shared taxis:', error);
      res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
  });
  

  


  const generateConfirmationCode = () => {
    // Generate a random 6-character alphanumeric confirmation code
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};




TaxiRoutePublic.post('/book_taxi', verify, async (req, res) => {
  try {
      const { userId, driverId, pickUpLocation, dropoff } = req.body;

      // Validate required fields
      if (!userId || !driverId || !pickUpLocation || !dropoff) {
          return res.status(400).json({ msg: "Fields cannot be empty" });
      }

      // Fetch driver details to confirm taxi type
      const driver = await Driver.findById(driverId);
      if (!driver) {
          return res.status(404).json({ msg: "Driver not found" });
      }

      // Ensure the driver is for a shared taxi
      if (driver.taxiType !== 'shared') {
          return res.status(400).json({ msg: "Only shared taxis are supported" });
      }

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
      const newBooking = {
          confirmationCode,
          userId,
          pickUpLocation,
          dropoff,
      };

      sharedTaxiBooking.bookings.push(newBooking);
      await sharedTaxiBooking.save();

      // Send notifications
      await SharedTaxiNotificationServices.sendSharedTaxiNotification(driverId, newBooking);

      return res.status(201).json({
          success: true,
          message: 'Shared taxi booked successfully!',
          confirmationCode,
          currentOccupancy: sharedTaxiBooking.bookings.length,
          maxCapacity: sharedTaxiCapacity,
      });
  } catch (error) {
      console.error('Error booking shared taxi:', error);
      res.status(500).json({ success: false, message: error.message });
  }
});





TaxiRoutePublic.post('/book_non_shared_taxi', verify, async (req, res) => {
  try {
      const {
          userId,
          driverId,
          dropoffLocation,
          pickupCoordinates,
          dropoffCoordinates,
          distance,
          time,
      } = req.body;

      // Validate required fields
      if (
          !userId ||
          !driverId ||
          !dropoffLocation ||
          !pickupCoordinates ||
          !dropoffCoordinates ||
          !distance ||
          !time
      ) {
          return res.status(400).json({ msg: 'Fields cannot be empty' });
      }

      // Fetch driver details
      const driver = await Driver.findById(driverId);
      if (!driver) {
          return res.status(404).json({ msg: 'Driver not found' });
      }

      // Ensure the taxi is non-shared
      if (driver.taxiType !== 'non-shared') {
          return res.status(400).json({ msg: 'This driver is not assigned to a non-shared taxi' });
      }

      // Generate a unique confirmation code
      const confirmationCode = generateConfirmationCode();

      // Create and save the new ride
      const newRide = new Ride({
          userId,
          driverId,
          dropoffLocation,
          pickupCoordinates,
          dropoffCoordinates,
          distance,
          time,
          confirmationCode,
          rideStatus: 'requested', // Initial ride status
      });

      const savedRide = await newRide.save();

      // Send notifications
      const user = await User.findById(userId);
      if (user) {
          await NotificationTaxiServices.sendTaxiNotification(
              userId,
              driver.name, // Sender name
              savedRide,
              'non-shared'
          );
      }

      await NotificationTaxiServices.sendTaxiNotification(
          driverId,
          user.fullname, // Sender name
          savedRide,
          'non-shared'
      );

      // Return success response
      return res.status(201).json({
          success: true,
          message: 'Non-shared taxi booked successfully!',
          rideDetails: {
              ...savedRide._doc,
              confirmationCode,
              rideStatus: 'requested',
          },
      });
  } catch (error) {
      console.error('Error booking non-shared taxi:', error);
      res.status(500).json({ success: false, message: 'An error occurred while booking the taxi' });
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
  
  TaxiRoutePublic.get('/check_if_user_booked/:driverId/:userId', verify, async (req, res) => {
    try {
      const { driverId, userId } = req.params;
  
      // Find the taxi by driverId
      const sharedTaxi = await SharedTaxiBooking.findOne({ driverId });
  
      if (!sharedTaxi) {
        // No bookings exist for this taxi yet
        return res.status(200).json({
          msg: "No bookings exist for this taxi yet.",
          userAlreadyBooked: false
        });
      }
  
      // Check if the user already has a booking
      const userAlreadyBooked = sharedTaxi.bookings.some(
        (booking) => booking.userId.toString() === userId
      );
  
      res.status(200).json({ userAlreadyBooked });
    } catch (error) {
      console.error("Error checking user booking:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });


  TaxiRoutePublic.put('/cancel_shared_taxi_order/:driverId/:userId', verify, async (req, res) => {
    try {
      const { driverId, userId } = req.params;
  
      // Find the shared taxi by driverId
      const sharedTaxi = await SharedTaxiBooking.findOne({ driverId });
  
      if (!sharedTaxi) {
        return res.status(404).json({
          msg: "Shared taxi not found.",
          userAlreadyBooked: false,
        });
      }
  
      // Check if the user is in the bookings array
      const userIndex = sharedTaxi.bookings.findIndex(
        (booking) => booking.userId.toString() === userId
      );
  
      if (userIndex === -1) {
        return res.status(200).json({
          msg: "User has not booked this taxi.",
          userAlreadyBooked: false,
        });
      }
  
      // Remove the user from the bookings array
      sharedTaxi.bookings.splice(userIndex, 1);
  
      // Save the updated shared taxi document
      await sharedTaxi.save();
  
      res.status(200).json({
        msg: "Booking canceled successfully.",
        userAlreadyBooked: false,
      });
    } catch (error) {
      console.error("Error canceling shared taxi order:", error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  });


  TaxiRoutePublic.post('/order_non_shared_taxi', verify, async(req, res) => {

    try {
      
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
      
    }


  })



  TaxiRoutePublic.get('/all_booked_non_shared_taxis',  async(req, res) => {

try {

  const allRides = await Ride.find()

  res.json({allRides})
  
} catch (error) {

  res.status(500).json({ success: false, message: error.message });
      
  
}

  })


  TaxiRoutePublic.get('/ride_requested/:id', verify, async (req, res) => {
    const { id } = req.params;

    try {
        // Look for requested rides
        const requestedRides = await Ride.find({
            userId: id,
            status: 'requested',
        });

        // If there are requested rides, return them
        if (requestedRides.length > 0) {
            return res.status(200).json(requestedRides);
        }

        // If no requested rides, check for any rides
        const allRides = await Ride.find({
            userId: id,
        });

        if (allRides.length > 0) {
            return res.status(200).json(allRides);  // Return other rides
        }

        // If no rides exist at all, return a friendly message and empty array
        res.status(200).json({
            message: 'No rides found for the user.',
            rides: [],
        });
    } catch (error) {
        console.error('Error fetching rides:', error);
        res.json({ message: 'An unexpected error occurred while fetching rides.' });
    }
});


TaxiRoutePublic.get('/user_ride_show/:id', verify, async(req, res) => {

  try {
    const {id} = req.params

    const singleUserRide = await Ride.findOne({userId: id})

    res.json({singleUserRide})
    
  } catch (error) {
    res.json({msg: `there was an error while fethcing the ride, error: ${error}`})
  }

})



TaxiRoutePublic.delete('/cancel_requested_ride/:id', verify, async(req, res) => {


  try {

    const {id} = req.params

    await Ride.findByIdAndDelete(id)

    res.json({msg: "Taxi has been cancelled!"})



    
  } catch (error) {
    res.status(500).json({ msg: `An unexpected error occurred while  deleting route: ${error}` });
  }

})
  
  

  module.exports = TaxiRoutePublic