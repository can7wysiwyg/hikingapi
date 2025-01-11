const DriverLocationRoute = require('express').Router()
const Driver = require('../models/DriverModel')
const verify = require('../middleware/verify')
const verifyDriver = require('../middleware/verifyDriver')


DriverLocationRoute.post("/updateLocation/:driverId", verify, verifyDriver, async (req, res) => {
  const { driverId } = req.params;
  const { latitude, longitude } = req.body;

  try {
    // Find the driver by their ID
    const driver = await Driver.findOne({ driverName: driverId });
    if (!driver) return res.status(404).json({ msg: "Driver not found" });

    // Update the driver's location with GeoJSON format
    driver.location = {
      type: "Point", // GeoJSON type must be "Point"
      coordinates: [longitude, latitude], // GeoJSON requires [longitude, latitude]
    };
    driver.lastUpdated = new Date(); // Update the lastUpdated timestamp

    await driver.save(); // Save the updated driver document

    res.status(200).json({ msg: "Driver location updated successfully" });
  } catch (error) {
    res.status(500).json({ msg: `Error updating location: ${error.message}` });
  }
});  



module.exports = DriverLocationRoute