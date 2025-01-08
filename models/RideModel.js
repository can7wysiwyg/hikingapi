const mongoose = require('mongoose');


const RideSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  
    dropoffLocation: { type: String, required: true },
    pickupCoordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    dropoffCoordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    distance: { type: String, required: true }, // Distance in km
    time: { type: String, required: true }, // Time in minutes or hours
    confirmationCode: {
      type: String,
      required: true,
      unique: true, // Ensure each confirmation code is unique
    },
    rideStatus: {
      type: String,
      enum: ['requested', 'in transit' ],
      required: true,
    },
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);



module.exports = mongoose.model('Ride', RideSchema);
