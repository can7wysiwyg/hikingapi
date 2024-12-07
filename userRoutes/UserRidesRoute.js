const UserRidesRoute = require('express').Router()
const Ride = require('../models/RideModel')
const asyncHandler = require("express-async-handler");
const verify = require("../middleware/verify");



UserRidesRoute.get('/history', async (req, res) => {
  const { userId } = req.query; // Pass userId as query param
  const { page = 1, limit = 10 } = req.query;

  try {
    const rides = await Ride.find({ userId })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalRides = await Ride.countDocuments({ userId });
    res.json({
      rides,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalRides / limit),
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});



UserRidesRoute.get('/history/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const ride = await Ride.findById(id).populate('driverId', 'name').exec();

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});




UserRidesRoute.patch('/confirm', async (req, res) => {
    const { rideId, confirmationCode } = req.body;
  
    try {
      // Find the ride
      const ride = await Ride.findById(rideId);
  
      if (!ride) {
        return res.status(404).json({ error: 'Ride not found' });
      }
  
      // Check if the ride is already confirmed or completed
      if (ride.status !== 'pending') {
        return res.status(400).json({ error: 'Ride cannot be confirmed at this stage' });
      }
  
      // (Optional) Verify confirmation code
      if (confirmationCode && confirmationCode !== ride.confirmationCode) {
        return res.status(400).json({ error: 'Invalid confirmation code' });
      }
  
      // Update status to confirmed
      ride.status = 'confirmed';
      await ride.save();
  
      res.json({ message: 'Ride confirmed successfully', ride });
    } catch (err) {
      res.status(500).json({ error: 'Server error', message: err.message });
    }
  });
  

module.exports = UserRidesRoute;

