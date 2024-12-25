const mongoose = require('mongoose');

const courierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Courier name is required'],
    trim: true,
  },
  
  contactInfo: {
    address: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      validate: {
        validator: function (email) {
          return /^\S+@\S+\.\S+$/.test(email);
        },
        message: 'Invalid email format',
      },
    },
  },
  approved: {
    type: Boolean,
    default: false, // Only approved couriers should be displayed to clients.
  },

  
}, {
    timestamps: true
});

 

module.exports = mongoose.model('Courier', courierSchema);
