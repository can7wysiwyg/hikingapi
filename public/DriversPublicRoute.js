const DriversPublicRoute = require('express').Router()
const User = require('../models/UserModel')
const Driver = require('../models/DriverModel')
const asyncHandler = require('express-async-handler')
const harvesine = require('haversine-distance')




DriversPublicRoute.get('/taxis_show_all', asyncHandler(async (req, res) => {
  const { latitude, longitude, maxDistance } = req.query; // Get maxDistance from query params
  const MAX_DISTANCE_KM = maxDistance ? parseFloat(maxDistance) : 10; // Default to 10 km if maxDistance is not provided

  try {
    // If no latitude or longitude is provided, return all approved drivers
    if (!latitude || !longitude) {
      const drivers = await Driver.find({ approvedItem: true });
      return res.json({ taxis: drivers });
    }

    // Convert to float and ensure they're numbers
    const passengerLocation = {
      type: "Point", // GeoJSON type
      coordinates: [parseFloat(longitude), parseFloat(latitude)], // Longitude, Latitude in that order
    };

    // Find nearby drivers using geospatial query
    const nearbyDrivers = await Driver.aggregate([
      {
        $geoNear: {
          near: passengerLocation, // Use passenger's location
          distanceField: "distance", // Field to store the calculated distance
          maxDistance: MAX_DISTANCE_KM * 1000, // MongoDB's maxDistance is in meters, so we multiply km by 1000
          spherical: true, // Ensure the calculation uses spherical geometry
        },
      },
      {
        $match: { approvedItem: true }, // Ensure that only approved drivers are returned
      },
      {
        $sort: { distance: 1 }, // Sort by distance (nearest first)
      },
    ]);

    res.status(200).json({ nearbyDrivers });
  } catch (error) {
    res.status(500).json({ msg: `Error: ${error.message}` });
  }
}));





// from search

DriversPublicRoute.get('/taxis_show_all_from_search', asyncHandler(async (req, res) => {
  const { latitude, longitude, maxDistance } = req.query; // Get maxDistance from query params
  const MAX_DISTANCE_KM = maxDistance ? parseFloat(maxDistance) : 20; // Default to 20 km if maxDistance is not provided

  try {
    // If no latitude or longitude is provided, return all approved drivers
    if (!latitude || !longitude) {
      const drivers = await Driver.find({ approvedItem: true });
      return res.json({ taxis: drivers });
    }

    // Convert to float and ensure they're numbers
    const passengerLocation = {
      type: "Point", // GeoJSON type
      coordinates: [parseFloat(longitude), parseFloat(latitude)], // Longitude, Latitude in that order
    };

    // Find nearby drivers using geospatial query
    const nearbyDrivers = await Driver.aggregate([
      {
        $geoNear: {
          near: passengerLocation, // Use passenger's location
          distanceField: "distance", // Field to store the calculated distance
          maxDistance: MAX_DISTANCE_KM * 1000, // MongoDB's maxDistance is in meters, so we multiply km by 1000
          spherical: true, // Ensure the calculation uses spherical geometry
        },
      },
      {
        $match: { approvedItem: true }, // Ensure that only approved drivers are returned
      },
      {
        $sort: { distance: 1 }, // Sort by distance (nearest first)
      },
    ]);

    res.status(200).json({ nearbyDrivers });
  } catch (error) {
    res.status(500).json({ msg: `Error: ${error.message}` });
  }
}));

// 


DriversPublicRoute.get('/taxis_show_taxi_type_non', asyncHandler(async (req, res) => { 
  const { latitude, longitude } = req.query; // Get maxDistance from query params
  const MAX_DISTANCE_KM =  20; // Default to 20 km if maxDistance is not provided

  try {
    // If no latitude or longitude is provided, return all approved drivers with taxiType: "non-shared"
    if (!latitude || !longitude) {
      const drivers = await Driver.find({ approvedItem: true, taxiType: "non-shared" });
      return res.json({ taxis: drivers });
    }

    // Convert to float and ensure they're numbers
    const passengerLocation = {
      type: "Point", // GeoJSON type
      coordinates: [parseFloat(longitude), parseFloat(latitude)], // Longitude, Latitude in that order
    };

    // Find nearby drivers using geospatial query
    const nearbyDrivers = await Driver.aggregate([
      {
        $geoNear: {
          near: passengerLocation, // Use passenger's location
          distanceField: "distance", // Field to store the calculated distance
          maxDistance: MAX_DISTANCE_KM * 1000, // MongoDB's maxDistance is in meters, so we multiply km by 1000
          spherical: true, // Ensure the calculation uses spherical geometry
        },
      },
      {
        $match: { approvedItem: true, taxiType: "non-shared" }, // Ensure only approved non-shared drivers are returned
      },
      {
        $sort: { distance: 1 }, // Sort by distance (nearest first)
      },
    ]);

    res.status(200).json({ nearbyDrivers });
  } catch (error) {
    res.status(500).json({ msg: `Error: ${error.message}` });
  }
}));




DriversPublicRoute.get('/taxis_show_taxi_type_shared', asyncHandler(async (req, res) => { 
  const { latitude, longitude } = req.query; // Get maxDistance from query params
  const MAX_DISTANCE_KM =  20; // Default to 20 km if maxDistance is not provided

  try {
    // If no latitude or longitude is provided, return all approved drivers with taxiType: "non-shared"
    if (!latitude || !longitude) {
      const drivers = await Driver.find({ approvedItem: true, taxiType: "shared" });
      return res.json({ taxis: drivers });
    }

    // Convert to float and ensure they're numbers
    const passengerLocation = {
      type: "Point", // GeoJSON type
      coordinates: [parseFloat(longitude), parseFloat(latitude)], // Longitude, Latitude in that order
    };

    // Find nearby drivers using geospatial query
    const nearbyDrivers = await Driver.aggregate([
      {
        $geoNear: {
          near: passengerLocation, // Use passenger's location
          distanceField: "distance", // Field to store the calculated distance
          maxDistance: MAX_DISTANCE_KM * 1000, // MongoDB's maxDistance is in meters, so we multiply km by 1000
          spherical: true, // Ensure the calculation uses spherical geometry
        },
      },
      {
        $match: { approvedItem: true, taxiType: "shared" }, // Ensure only approved non-shared drivers are returned
      },
      {
        $sort: { distance: 1 }, // Sort by distance (nearest first)
      },
    ]);

    res.status(200).json({ nearbyDrivers });
  } catch (error) {
    res.status(500).json({ msg: `Error: ${error.message}` });
  }
}));






DriversPublicRoute.get('/drivers_show_all', asyncHandler(async(req, res) => {

    try {

        const drivers = await User.find({role: 11}).select("_id fullname userPhoto")

        res.json({drivers})

        
    } catch (error) {
        res.json({msg: `there was an error while fetching users: ${error.message}`})
    }

}))


DriversPublicRoute.get(
    '/single_driver/:id',
    asyncHandler(async (req, res) => {
      try {
        const { id } = req.params;
  
        // Fetch the driver details using the `Driver` model
        const driver = await Driver.findOne({driverName: id});
  
        if (!driver) {
          return res.status(404).json({ msg: 'Driver not found' });
        }
  
        // Fetch user details using the associated User ID
        const user = await User.findById(driver.driverName); // Replace `userId` with the correct field in the Driver model linking to the User model
  
        if (!user) {
          return res.status(404).json({ msg: 'User not found for this driver' });
        }
  
        
        const driverDetails = {
         userPhoto: user.userPhoto,
          fullname: user.fullname,
          phone: user.phone,
          email: user.email,
          userLocation: user.userLocation,
          driverCarPlate: driver.driverCarPlate,
          driverCarCapacity: driver.driverCarCapacity,
          driverCarPhoto: driver.driverCarPhoto,
          driverId: driver._id,
          vehicleType: driver.vehicleType,
          taxiType: driver.taxiType
        
        };
  
        // Respond with the combined driver details
        res.json(driverDetails);
      } catch (error) {
        res.status(500).json({
          msg: `There was an error while fetching the driver: ${error.message}`,
        });
      }
    })
  );
  

 
DriversPublicRoute.get('/taxi_single/:id', asyncHandler(async(req, res) => {

    try {

        const {id} = req.params

        const taxi = await Driver.findById(id)

      

        const user = await User.findById(taxi.driverName)

        


        if (!user) {
          return res.status(404).json({ msg: 'User not found for this driver' });
        }
  
        
        const driverDetails = {
         userPhoto: user.userPhoto,
          fullname: user.fullname,
          phone: user.phone,
          email: user.email,
          personId: user._id,
          userLocation: user.userLocation,
          driverCarPlate: taxi.driverCarPlate,
          driverCarCapacity: taxi.driverCarCapacity,
          driverCarPhoto: taxi.driverCarPhoto,
           driverName: taxi.driverName,
          driverId: taxi._id,
          vehicleType: taxi.vehicleType,
          taxiType: taxi.taxiType,
          carLocation: taxi.location
        
        };
  
        // Respond with the combined driver details
        res.json(driverDetails);





        
        
    } catch (error) {
        res.json({msg: `there was an error: ${error.message}`})
    }


}))  


DriversPublicRoute.get('/taxi_type_enum', asyncHandler(async(req, res) => {

try {

  const taxiTypeEnums = await Driver.schema.path('taxiType').options.enum

    res.json({taxiTypeEnums})

  
} catch (error) {
  res.json({msg: `there was a problem while loading this info ${error.message}`})
}


}))

module.exports = DriversPublicRoute
