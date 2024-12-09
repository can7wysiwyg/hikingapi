const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  vehicleType: {
    type: String,
    enum: ['truck', 'van', 'small car', 'motorcycle', 'pickup truck'], // Allowed vehicle types
    required: true
  },

  deliveryCarPhoto: {
    type: String,
    required: true

  },


  owner: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'User'

  },
  loadWeight: {
    type: Number, // Weight in kilograms
    required: true,
    min: 0
  },

  
  packageSize: {
    type: String,
    enum: ['small', 'medium', 'large'], // Enum to define package size
     },
  
  
}, {
    timestamps: true
});

const Delivery = mongoose.model('Delivery', deliverySchema);

module.exports = Delivery;




// deliveryAddress: {
//   type: String, // Destination address
//   default: null
 
// },
// pickupAddress: {
//   type: String,
//   default: null 
  
// },
// deliveryStatus: {
//   type: String,
//   enum: ['pending', 'in transit', 'delivered', 'cancelled'], // Tracking status
//   default: 'pending'
// },
