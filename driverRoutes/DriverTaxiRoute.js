const DriverTaxiRoute = require('express').Router()
const TaxiRoute = require('../models/TaxiRouteModel')
const Driver = require('../models/DriverModel')
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


  module.exports = DriverTaxiRoute
  
  
//   router.post('/user/book', async (req, res) => {
//     try {
//       const { userId, routeId, pickupLocation, dropOffLocation } = req.body;
  
//       // Validate data
//       if (!userId || !routeId || !pickupLocation || !dropOffLocation) {
//         return res.status(400).json({ success: false, message: 'All fields are required' });
//       }
  
//       const route = await Route.findById(routeId);
//       if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
  
//       const booking = {
//         userId,
//         pickupLocation,
//         dropOffLocation,
//         fare: route.fare,
//       };
  
//       // Save the booking (assuming bookings are stored in the Route model for simplicity)
//       route.bookings.push(booking);
//       await route.save();
  
//       res.status(201).json({ success: true, message: 'Route booked successfully', booking });
//     } catch (error) {
//       res.status(500).json({ success: false, message: error.message });
//     }
//   });