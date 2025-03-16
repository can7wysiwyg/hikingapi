const NearbyTaxisRoute = require('express').Router()
const Driver = require('../models/DriverModel')
const harvesine = require('haversine-distance')




NearbyTaxisRoute.get("/getNearbyTaxis", async (req, res) => {
    const { latitude, longitude } = req.query;
  
  
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
  
            try {
              const distance = harvesine(passengerLocation, driverLocation); // Distance in meters
              console.log(distance)
              return {
                driverId: driver._id,
                name: driver.driverName,
                distance: (distance / 1000).toFixed(2), // Convert to kilometers
              };
            } catch (distanceError) {
              console.error("Error calculating distance for driver:", driver._id, distanceError);
              return null; // Skip this driver if distance calculation fails
            }
          }
          return null; // Skip drivers with invalid location
        })
        .filter((driver) => driver) // Filter out null entries
        .sort((a, b) => a.distance - b.distance); // Sort by distance
  
      console.log("Nearby drivers:", nearbyDrivers);
  
      res.status(200).json({ nearbyDrivers });
    } catch (error) {
      console.error("Error fetching nearby taxis:", error);
      res.status(500).json({ msg: `Error fetching nearby taxis: ${error.message}` });
    }
  });
  
  




module.exports = NearbyTaxisRoute