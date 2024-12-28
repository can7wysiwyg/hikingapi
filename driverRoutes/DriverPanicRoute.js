const DriverPanicRoute = require('express').Router()
const PanicAlert = require('../models/PanicModel')
const Driver = require("../models/DriverModel")
const User = require('../models/UserModel')
const verify = require("../middleware/verify")
const verifyDriver = require("../middleware/verifyDriver")
const nodemailer = require('nodemailer')
const { default: axios } = require('axios')


DriverPanicRoute.post('/driver_send_alert/:driverId', verify, verifyDriver, async (req, res) => {
    try {
      const { driverId } = req.params;
      const { location, type } = req.body; // Ensure to send location and type from the frontend

      
      // Fetch driver details
      const driver = await Driver.findOne({_id: driverId});
      if (!driver) return res.status(404).json({ msg: "Driver not found" });
  
      const driverName = driver.driverName;
      const user = await User.findById(driverName);
      if (!user) return res.status(404).json({ msg: "User associated with driver not found" });
  
      const item = {
        fullname: user.fullname,
        phone: user.phone,
        email: user.email,
        driverCarPlate: driver.driverCarPlate,
      };
  
      // Translate coordinates into a human-readable address using Nominatim
      const { latitude, longitude } = location;
      const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
  
      const geocodeResponse = await axios.get(geocodeUrl, {
        headers: {
          'User-Agent': 'YourAppName', // Ensure you provide a User-Agent for Nominatim API compliance
        },
      });
  
      if (!geocodeResponse.data || !geocodeResponse.data.address) {
        return res.status(500).json({ msg: "Failed to get address from coordinates" });
      }
  
      const readableAddress = geocodeResponse.data.address ? geocodeResponse.data.address : "Address not available";
         
    //   if (!readableAddress || !readableAddress.road || !readableAddress.state || !readableAddress.country) {
    //     console.log('Address information is incomplete or not available');
    //     return res.status(400).json({ msg: 'Address information is incomplete' });
    //   }

      let road = readableAddress?.road
      let state = readableAddress?.state
      let country = readableAddress?.country
      

      // Save panic alert in the database
      const panicAlert = new PanicAlert({
        type,
        driverId,
        location,
        timestamp: new Date(),
      });
      await panicAlert.save();
  
      // Send email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: "Driver Panic Alert",
        text: `
          A panic alert has been triggered by the driver:
          - Name: ${item.fullname}
          - Phone: ${item.phone}
          - Car Plate: ${item.driverCarPlate}
          - Panic Type: ${type}
          - Location: ${road}, ${state}, ${country}   (${latitude}, ${longitude})
          - Timestamp: ${new Date().toLocaleString()}
        `,
      };
  
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ msg: "Admin has been alerted." });
    } catch (error) {
        console.log(error.message)
      res.status(500).json({ msg: `There was a problem sending the alert: ${error.message}` });
    }
  });




module.exports = DriverPanicRoute