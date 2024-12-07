const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
 confirmationCode: { type: String, required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  pickupLocation: { type: String, required: true },
  dropoffLocation: { type: String, required: true },
  fare: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['completed', 'canceled'], default: 'completed' },
}, {
    timestamps: true
});

module.exports = mongoose.model('Ride', RideSchema);
