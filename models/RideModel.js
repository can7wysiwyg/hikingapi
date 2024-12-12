const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  pickupLocation: { type: String, required: true },
  dropoffLocation: { type: String, required: true },
  fare: { type: Number, required: true },
  date: { type: Date, default: Date.now },

}, {
    timestamps: true
});

module.exports = mongoose.model('Ride', RideSchema);
