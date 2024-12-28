const PassengerPanicRoute = require('express').Router()
const User = require('../models/UserModel')
const PassengerPanicAlert = require('../models/PassengerPanicModel')
const verify = require("../middleware/verify")
const nodemailer = require('nodemailer')
const { default: axios } = require('axios')



PassengerPanicRoute.post("/passenger_send_alert/:passengerId", verify, async (req, res) => {
    try {
      const { passengerId } = req.params;
      const { type, location } = req.body;
  
      // Validate passenger ID
      const passenger = await User.findOne({_id: passengerId});
      if (!passenger) {
        return res.status(404).json({ msg: "Passenger not found" });
      }
  
      let fullname = passenger.fullname  
      let phone = passenger.phone

      // Reverse geocode the location
      const { latitude, longitude } = location;
      const reverseGeocodeUrl = "https://nominatim.openstreetmap.org/reverse";
      const response = await axios.get(reverseGeocodeUrl, {
        params: {
          lat: latitude,
          lon: longitude,
          format: "json",
          addressdetails: 1,
        },
        headers: {
          "User-Agent": "PassengerApp",
        },
      });
  
      const readableAddress = response.data?.address || {};
      const locationDescription = `${readableAddress.road || "Unknown Road"}, ${
        readableAddress.state || "Unknown State"
      }, ${readableAddress.country || "Unknown Country"}`;
  
      // Save panic alert in the database
      const panicAlert = new PassengerPanicAlert({
        type,
        passengerId,
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
        subject: "Passenger Panic Alert",
        text: `
          A panic alert has been triggered by the passenger:
          - Name: ${fullname}
          - Phone: ${phone}
          - Panic Type: ${type}
          - Location: ${locationDescription} (${latitude}, ${longitude})
          - Timestamp: ${new Date().toLocaleString()}
        `,
      };
  
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ msg: "Support team has been alerted." });
    } catch (error) {
      console.error("Error handling passenger panic alert:", error.message);
      res.status(500).json({ msg: `Error: ${error.message}` });
    }
  });
  
  


module.exports = PassengerPanicRoute