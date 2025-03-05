// require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const port  = process.env.PORT || 5500
const cors = require('cors')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const UserAuth = require('./userRoutes/UserAuthRoute')
const UserUpdateRoute = require('./userRoutes/UserUpdateRoute')
const DriverInfoRoute = require('./driverRoutes/DriverInfoRoute')
const DriversPublicRoute = require('./public/DriversPublicRoute')
const { default: axios } = require('axios')
const MessagingRoute = require('./messaging/MessagingRoute')
const AllUsersRoute = require('./public/AllUsersRoute')
const UserRidesRoute = require('./userRoutes/UserRidesRoute')
const DriverTaxiRoute = require('./driverRoutes/DriverTaxiRoute')
const DeliverDriverRoute = require('./deliveries/DeliverDriverRoute')
const DeliverPublicRoute = require('./deliveries/DeliveryPublicRoute')
const TaxiRoutePublic = require('./public/TaxiRoutePublic')
const AdminCourierRoute = require('./adminRoutes/AdminCourierRoute')
const CouriersPublic = require('./public/CouriersPublic')
const DriverPanicRoute = require('./driverRoutes/DriverPanicRoute')
const PassengerPanicRoute = require('./userRoutes/PassengerPanicRoute')
const DriverLocationRoute = require('./driverRoutes/DriverLocationRoute')
const NearbyTaxisRoute = require('./public/NearbyTaxisRoute')
const UserFirstRoute = require('./userRoutes/UserFirstRoute')
const NotsEndP = require('./notifications/NotsEndP')
const AdminAuthRoute = require('./adminRoutes/AdminAuthRoute')
const AdminUsersRoute = require('./adminRoutes/AdminUsersRoute')
const AdminTaxisRoute = require('./adminRoutes/AdminTaxisRoute')
const TripCountRoute = require('./driverRoutes/TripCountRoute')



mongoose.connect(process.env.MONGOURL)

const db = mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function(){
    console.log("connected to database");
  try {
    db.collection('drivers')
    db.collection('taxiroutes')

    
  } catch (error) {
    console.error('Error checking indexes:', error);
    
  }


  });



  



  app.use(cors())
  app.use(express.json({limit: '50mb'}))
  app.use(express.urlencoded({extended: true, limit: '50mb'}))
  app.use(cookieParser())
  app.use(fileUpload({
    useTempFiles: true
}))
  

app.use(UserAuth)
app.use(UserUpdateRoute)
app.use(DriverInfoRoute)
app.use(DriversPublicRoute)
app.use(MessagingRoute)
app.use(AllUsersRoute)
app.use(UserRidesRoute)
app.use(DriverTaxiRoute)
app.use(DeliverDriverRoute)
app.use(DeliverPublicRoute)
app.use(TaxiRoutePublic)
app.use(AdminCourierRoute)
app.use(CouriersPublic)
app.use(DriverPanicRoute)
app.use(PassengerPanicRoute)
app.use(DriverLocationRoute)
app.use(NearbyTaxisRoute)
app.use(UserFirstRoute)
app.use(NotsEndP)
app.use(AdminAuthRoute)
app.use(AdminUsersRoute)
app.use(AdminTaxisRoute)
app.use(TripCountRoute)






app.get('/api/reverse-geocode', async (req, res) => {
  const { latitude, longitude } = req.query;
  
  try {
    // Send a reverse geocode request to Nominatim
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: latitude,        // Latitude
        lon: longitude,       // Longitude
        format: 'json',       // Response format
        addressdetails: 1,    // Include address details
      },
      headers: {
        'User-Agent': 'YourAppName', // Set a User-Agent to identify your app
      },
    });

    if (response.data && response.data.address) {
      const address = response.data.address;
      res.json({ address: address });
    } else {
      res.status(404).json({ error: 'Address not found' });
    }
  } catch (error) {
    console.error('Error fetching address:', error.message);
    res.status(500).json({ error: 'Error fetching address from Nominatim' });
  }
});

  


app.listen(port, () => {
    console.log(`Your server is now running on port ${port}`);
})
