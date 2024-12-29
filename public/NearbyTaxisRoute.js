const NearbyTaxisRoute = require('express').Router()
const Driver = require('../models/DriverModel')
const harvesine = require('haversine-distance')


NearbyTaxisRoute.post("/getNearbyTaxis", async (req, res) => {
    const { latitude, longitude } = req.body;
  
    try {
      const drivers = await Driver.find({}); // Fetch all drivers (you can filter active ones)
      const passengerLocation = { latitude, longitude };
  
      // Calculate distances
      const nearbyDrivers = drivers
        .map((driver) => {
          if (driver.location && driver.location.latitude && driver.location.longitude) {
            const driverLocation = {
              latitude: driver.location.latitude,
              longitude: driver.location.longitude,
            };
  
            const distance = haversine(passengerLocation, driverLocation); // Distance in meters
            return {
              driverId: driver._id,
              name: driver.name,
              distance: (distance / 1000).toFixed(2), // Convert to kilometers
            };
          }
          return null;
        })
        .filter((driver) => driver) // Filter out null entries
        .sort((a, b) => a.distance - b.distance); // Sort by distance
  
      res.status(200).json({ nearbyDrivers });
    } catch (error) {
      res.status(500).json({ msg: `Error fetching nearby taxis: ${error.message}` });
    }
  });
  




module.exports = NearbyTaxisRoute