const DriverLocationRoute = require('express').Router()
const Driver = require('../models/DriverModel')
const verify = require('../middleware/verify')
const verifyDriver = require('../middleware/verifyDriver')


DriverLocationRoute.post("/updateLocation/:driverId", verify, verifyDriver, async (req, res) => {
    const { driverId } = req.params;
    const { latitude, longitude } = req.body;
  
    try {
      const driver = await Driver.findOne({driverName: driverId});
      if (!driver) return res.status(404).json({ msg: "Driver not found" });
  
      // Update driver's location
      driver.location = { latitude, longitude };
      driver.lastUpdated = new Date();
      await driver.save();
  
      res.status(200).json({ msg: "Driver location updated successfully" });
    } catch (error) {
      res.status(500).json({ msg: `Error updating location: ${error.message}` });
    }
  });
  



module.exports = DriverLocationRoute