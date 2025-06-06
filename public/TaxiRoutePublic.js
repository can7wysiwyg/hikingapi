const TaxiRoutePublic = require('express').Router()
const TaxiRoute = require("../models/TaxiRouteModel");
const Ride = require('../models/RideModel')
const verify = require('../middleware/verify')
const Driver = require('../models/DriverModel')
const SharedTaxiBooking = require('../models/SharedTaxiBooking')
const NotificationTaxiServices = require('../notifications/NotificationTaxiServices')
const User = require('../models/UserModel');
const SharedTaxiNotificationServices = require('../notifications/SharedTaxiNotificationBooking');
const TaxiPrivateCancelNotification = require('../notifications/TaxiPrivateCancelNotification');
const TaxiSharedCancelNotification = require('../notifications/TaxiSharedCancelNotification');




TaxiRoutePublic.get('/taxi_route/:id',  async(req, res) => {


    try {
        const {id} = req.params

        const myRoutes = await TaxiRoute.find({taxiId: id})

        res.json(myRoutes)
        
    } catch (error) {

        res.status(500).json({ success: false, message: error.message });
        
    }

  })


    

  TaxiRoutePublic.get('/taxi_single_route/:id', async(req, res) => {
    try {

      const {id} = req.params

      const taxiRoute = await TaxiRoute.findById(id)

      res.json({taxiRoute})
  
} catch (error) {
  res.json({msg: "try again later"})
}

  })


  TaxiRoutePublic.get('/taxi_all_routes', async(req, res) => {

    try{

      const allRoutes = await TaxiRoute.find()

      res.json({allRoutes})

    } catch(error) {
      
      res.json({msg: "try again later"})
    }

  })
  

  const generateConfirmationCode = () => {
    // Generate a random 6-character alphanumeric confirmation code
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};




TaxiRoutePublic.post('/book_taxi', verify, async (req, res) => {
  try {
      const { userId, driverId, pickUpLocation, dropoff } = req.body;

    
      if (!userId || !driverId || !pickUpLocation || !dropoff) {
          return res.status(400).json({ msg: "Fields cannot be empty" });
      }

      
      const driver = await Driver.findById(driverId);
      if (!driver) {
          return res.status(404).json({ msg: "Driver not found" });
      }

      
      if (driver.taxiType !== 'shared') {
          return res.status(400).json({ msg: "Only shared taxis are supported" });
      }

      const sharedTaxiCapacity = parseInt(driver.driverCarCapacity, 10);

      
      let sharedTaxiBooking = await SharedTaxiBooking.findOne({ driverId });
      if (!sharedTaxiBooking) {
          sharedTaxiBooking = new SharedTaxiBooking({
              driverId,
              taxiCapacity: sharedTaxiCapacity,
              bookings: [], 
          });
      }

      
      if (sharedTaxiBooking.bookings.length >= sharedTaxiCapacity) {
          return res.status(400).json({ msg: "Taxi is fully booked" });
      }

    
      const confirmationCode = generateConfirmationCode();

      
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

      
      const driver = await Driver.findById(driverId);
      if (!driver) {
          return res.status(404).json({ msg: 'Driver not found' });
      }

      
      if (driver.taxiType !== 'non-shared') {
          return res.status(400).json({ msg: 'This driver is not assigned to a non-shared taxi' });
      }

      
      const confirmationCode = generateConfirmationCode();

      
      const newRide = new Ride({
          userId,
          driverId,
          dropoffLocation,
          pickupCoordinates,
          dropoffCoordinates,
          distance,
          time,
          confirmationCode,
          rideStatus: 'requested', 
      });
      const user = await User.findById(userId);


      const savedRide = await newRide.save();

      // Send notifications
     
      if (user) {
          await NotificationTaxiServices.sendTaxiNotification(
              
              savedRide,
              'non-shared'
          );
      }

     
      
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







TaxiRoutePublic.get('/taxi_occupancy/:driverId', verify,  async (req, res) => {
    try {
        const { driverId } = req.params;  

        
        
        const sharedTaxi = await SharedTaxiBooking.findOne({ driverId });
        
        if (!sharedTaxi) {
          
            const driver = await Driver.findById(driverId);
            if (!driver) {
                return res.status(404).json({ msg: "Driver not found" });
            }
            const maxCapacity = parseInt(driver.driverCarCapacity, 10);  

            return res.status(200).json({
                success: true,
                currentOccupancy: 0,  
                maxCapacity,          
                message: "Taxi is available, waiting for passengers."
            });
        }

      
        const currentOccupancy = sharedTaxi.bookings.length;

      
        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({ msg: "Driver not found" });
        }

        const maxCapacity = parseInt(driver.driverCarCapacity, 10);  

        
        res.status(200).json({
            success: true,
            currentOccupancy,
            maxCapacity,           
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
  
    
      const sharedTaxi = await SharedTaxiBooking.findOne({ driverId });
  
      if (!sharedTaxi) {
      
        return res.status(200).json({
          msg: "No bookings exist for this taxi yet.",
          userAlreadyBooked: false
        });
      }
  
    
      const userAlreadyBooked = sharedTaxi.bookings.some(
        (booking) => booking.userId.toString() === userId
      );
  
      res.status(200).json({ userAlreadyBooked });
    } catch (error) {
      console.error("Error checking user booking:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });


  

  TaxiRoutePublic.get("/single_user_booked/:userId",  async (req, res) => {
    try {

      const { userId } = req.params;

      
      const sharedTaxis = await SharedTaxiBooking.find({
        "bookings.userId": userId,
      });
  
      if (sharedTaxis.length === 0) {
        
        return res.status(200).json({
          msg: "User has not booked any shared taxi.",
          userAlreadyBooked: false,
        });
      }
  
    
      const userBookings = sharedTaxis.map((taxi) => {
        const booking = taxi.bookings.find(
          (booking) => booking.userId.toString() === userId
        );
  
        return {
          confirmationCode: booking.confirmationCode,
          driverId: taxi.driverId,
          pickUpLocation: booking.pickUpLocation,
          dropoff: booking.dropoff,
          _id: booking._id,
          status: booking.status, 
        };
      });
  
      return res.status(200).json({
        msg: "User has bookings for shared taxis.",
        userAlreadyBooked: true,
        bookings: userBookings,
      });
  
      
    } catch (error) {
            res.status(500).json({
              msg: "An error occurred while processing the request.",
             });
    }
  });
  
  


  TaxiRoutePublic.put('/cancel_shared_taxi_order/:driverId/:userId',  async (req, res) => {
    try {
      const { driverId, userId } = req.params;

    
  
    
      const sharedTaxi = await SharedTaxiBooking.findOne({ driverId });
  
      if (!sharedTaxi) {
        return res.status(404).json({
          msg: "Shared taxi not found.",
          userAlreadyBooked: false,
        });
      }
  
      
      const userIndex = sharedTaxi.bookings.findIndex(
        (booking) => booking.userId.toString() === userId
      );
  
      if (userIndex === -1) {
        return res.status(200).json({
          msg: "User has not booked this taxi.",
          userAlreadyBooked: false,
        });
      }
 
      await TaxiSharedCancelNotification.sendTaxiSharedCancelNotification(driverId)

  
    
      sharedTaxi.bookings.splice(userIndex, 1);
  
      
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
  
        const requestedRides = await Ride.find({
            userId: id,
            status: 'requested',
        });

      
        if (requestedRides.length > 0) {
            return res.status(200).json(requestedRides);
        }

      
        const allRides = await Ride.find({
            userId: id,
        });

        if (allRides.length > 0) {
            return res.status(200).json(allRides);  
        }

        
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


    let taxiId = id
    await TaxiPrivateCancelNotification.sendTaxiPrivateCancelNotification(taxiId);


    await Ride.findByIdAndDelete(id)

    
    
    res.json({msg: "Taxi has been cancelled!"})



    
  } catch (error) {
    console.log("this is private cancel errro", error)
    res.json({ msg: `prob: ${error}` });
  }

})


TaxiRoutePublic.delete('/erase_non_shared_from_booking_page/:id', verify, async(req, res) => {

  try {

    const {id} = req.params

    const  singleUserRide = await Ride.findOne({userId: id})

    let taxiId = singleUserRide._id
    
    await TaxiPrivateCancelNotification.sendTaxiPrivateCancelNotification(taxiId);


    await Ride.findByIdAndDelete(singleUserRide._id)
     
    

    res.json({msg: "cancelled successfully!!"})

    
  } catch (error) {
    res.json({ msg: `something: ${error}` });
    
  }


})



  

  module.exports = TaxiRoutePublic