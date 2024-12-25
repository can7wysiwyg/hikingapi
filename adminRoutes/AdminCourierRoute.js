const AdminCourierRoute = require('express').Router()
const Courier = require('../models/CourierModel')




AdminCourierRoute.post('/create_courier', async (req, res) => {
    const {
      name,
      
      contactInfo: {
        address = '',
        phone = '',
        email = '',
      } = {}, // Destructure with defaults to ensure no errors if contactInfo is omitted
    } = req.body;
  
    try {
      const newCourier = new Courier({
        name,
      
        contactInfo: {
          address,
          phone,
          email,
        },
      });
  
      await newCourier.save();
      res.status(201).json({ message: 'Courier added successfully', courier: newCourier });
    } catch (error) {
      res.status(400).json({ message: 'Error adding courier', error });
    }
  });
  


  module.exports = AdminCourierRoute