const DriversPublicRoute = require('express').Router()
const User = require('../models/UserModel')
const Driver = require('../models/DriverModel')
const TaxiRoute = require('../models/TaxiRouteModel')
const asyncHandler = require('express-async-handler')
const harvesine = require('haversine-distance')




DriversPublicRoute.get('/taxis_show_all', asyncHandler(async (req, res) => {
  const { latitude, longitude, maxDistance } = req.query; 
  const MAX_DISTANCE_KM = maxDistance ? parseFloat(maxDistance) : 10; 

  try {
    
    if (!latitude || !longitude) {
      const drivers = await Driver.find({ approvedItem: true, ableToBorrow: false });
      return res.json({ taxis: drivers });
    }


    const passengerLocation = {
      type: "Point", 
      coordinates: [parseFloat(longitude), parseFloat(latitude)], 
    };

  
    const nearbyDrivers = await Driver.aggregate([
      {
        $geoNear: {
          near: passengerLocation, 
          distanceField: "distance", 
          maxDistance: MAX_DISTANCE_KM * 1000, 
          spherical: true, 
        },
      },
      {
        $match: { approvedItem: true, ableToBorrow: false }, 
      },
      {
        $sort: { distance: 1 }, 
      },
    ]);

    res.status(200).json({ nearbyDrivers });
  } catch (error) {
    res.status(500).json({ msg: `Error: ${error.message}` });
  }
}));


// borrow car
DriversPublicRoute.get('/taxis_borrow_show_all', asyncHandler(async (req, res) => {
  const { latitude, longitude, maxDistance } = req.query; 
  const MAX_DISTANCE_KM = maxDistance ? parseFloat(maxDistance) : 10; 

  try {
    
    if (!latitude || !longitude) {
      const drivers = await Driver.find({ approvedItem: true, ableToBorrow: true });
      return res.json({ taxis: drivers });
    }


    const passengerLocation = {
      type: "Point", 
      coordinates: [parseFloat(longitude), parseFloat(latitude)], 
    };

  
    const nearbyTaxis = await Driver.aggregate([
      {
        $geoNear: {
          near: passengerLocation, 
          distanceField: "distance", 
          maxDistance: MAX_DISTANCE_KM * 1000, 
          spherical: true, 
        },
      },
      {
        $match: { approvedItem: true,  ableToBorrow: true }, 
      },
      {
        $sort: { distance: 1 }, 
      },
    ]);

    res.status(200).json({ nearbyTaxis });
  } catch (error) {
    res.status(500).json({ msg: `Error: ${error.message}` });
  }
}));


// 



DriversPublicRoute.get('/taxis_going_long_distance', asyncHandler(async (req, res) => {
  try {
    const {districtQuery, latitude, longitude} = req.query;
    const MAX_DISTANCE_KM = 30;

    
    if (!latitude || !longitude || !districtQuery) {
      if (districtQuery) {
        const taxiIds = await TaxiRoute.find({destinationArea: districtQuery}).select("taxiId");
        const taxiIdValues = taxiIds.map(item => item.taxiId);
        const drivers = await Driver.find({ 
          approvedItem: true,
          _id: { $in: taxiIdValues },
          taxiType: "shared"
        });
        return res.json({ taxis: drivers });
      } else {
        const drivers = await Driver.find({ approvedItem: true, taxiType: "shared", ableToBorrow: false });
        return res.json({ taxis: drivers });
      }
    }

  
    const passengerLocation = {
      type: "Point", 
      coordinates: [parseFloat(longitude), parseFloat(latitude)], 
    };

    
    const taxisGoingToDestination = await TaxiRoute.find({destinationArea: districtQuery}).select("taxiId");
    const taxiIdValues = taxisGoingToDestination.map(item => item.taxiId);
    
    
    const nearbyDriversGoingToDestination = await Driver.aggregate([
      {
        $geoNear: {
          near: passengerLocation,
          distanceField: "distance",
          maxDistance: MAX_DISTANCE_KM * 1000,
          spherical: true,
        },
      },
      {
        $match: { 
          approvedItem: true,
          ableToBorrow: false,
          _id: { $in: taxiIdValues },
          taxiType: "shared"
        },
      },
      {
        $sort: { distance: 1 }, 
      },
    ])
    
    res.status(200).json({ taxis: nearbyDriversGoingToDestination });
    
  } catch (error) {
    console.log("there was a problem getting taxis by district", error);
    res.status(500).json({msg: "there was a problem getting taxis by district", error: error.message });
  }
}));



// from search

DriversPublicRoute.get('/taxis_show_all_from_search', asyncHandler(async (req, res) => {
  const { latitude, longitude, maxDistance } = req.query; 
  const MAX_DISTANCE_KM = maxDistance ? parseFloat(maxDistance) : 20; 

  try {
    
    if (!latitude || !longitude) {
      const drivers = await Driver.find({ approvedItem: true, ableToBorrow: false });
      return res.json({ taxis: drivers });
    }

    
    const passengerLocation = {
      type: "Point", 
      coordinates: [parseFloat(longitude), parseFloat(latitude)], 
    };

    
    const nearbyDrivers = await Driver.aggregate([
      {
        $geoNear: {
          near: passengerLocation, 
          distanceField: "distance", 
          maxDistance: MAX_DISTANCE_KM * 1000,
          spherical: true, 
        },
      },
      {
        $match: { approvedItem: true, ableToBorrow: false }, 
      },
      {
        $sort: { distance: 1 }, 
      },
    ]);

    res.status(200).json({ nearbyDrivers });
  } catch (error) {
    res.status(500).json({ msg: `Error: ${error.message}` });
  }
}));

// 


DriversPublicRoute.get('/taxis_show_taxi_type_non', asyncHandler(async (req, res) => { 
  const { latitude, longitude } = req.query; 
  const MAX_DISTANCE_KM =  20; 

  try {
    
    if (!latitude || !longitude) {
      const drivers = await Driver.find({ approvedItem: true, taxiType: "non-shared", ableToBorrow: false });
      return res.json({ taxis: drivers });
    }

    
    const passengerLocation = {
      type: "Point", 
      coordinates: [parseFloat(longitude), parseFloat(latitude)], 
    };

    
    const nearbyDrivers = await Driver.aggregate([
      {
        $geoNear: {
          near: passengerLocation, 
          distanceField: "distance", 
          maxDistance: MAX_DISTANCE_KM * 1000, 
          spherical: true, 
        },
      },
      {
        $match: { approvedItem: true, taxiType: "non-shared", ableToBorrow: false }, 
      },
      {
        $sort: { distance: 1 }, 
      },
    ]);

    res.status(200).json({ nearbyDrivers });
  } catch (error) {
    res.status(500).json({ msg: `Error: ${error.message}` });
  }
}));




DriversPublicRoute.get('/taxis_show_taxi_type_shared', asyncHandler(async (req, res) => { 
  const { latitude, longitude } = req.query; 
  const MAX_DISTANCE_KM =  20; 

  try {

    if (!latitude || !longitude) {
      const drivers = await Driver.find({ approvedItem: true, taxiType: "shared", ableToBorrow: false });
      return res.json({ taxis: drivers });
    }

    
    const passengerLocation = {
      type: "Point", 
      coordinates: [parseFloat(longitude), parseFloat(latitude)], 
    };

    
    const nearbyDrivers = await Driver.aggregate([
      {
        $geoNear: {
          near: passengerLocation, 
          distanceField: "distance", 
          maxDistance: MAX_DISTANCE_KM * 1000, 
          spherical: true, 
        },
      },
      {
        $match: { approvedItem: true, taxiType: "shared", ableToBorrow: false }, 
      },
      {
        $sort: { distance: 1 }, 
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
  
      
        const driver = await Driver.findOne({driverName: id});
  
        if (!driver) {
          return res.status(404).json({ msg: 'Driver not found' });
        }
  
        
        const user = await User.findById(driver.driverName); 
  
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
          drivingLicence: driver.drivingLicence,
          driverId: driver._id,
          vehicleType: driver.vehicleType,
          taxiType: driver.taxiType,
          ableToBorrow: driver.ableToBorrow
        


        
        };
  
        
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
