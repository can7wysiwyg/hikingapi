const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  pickupLocation: { type: String },
  dropOffLocation: { type: String },
  fare: { type: Number, },
  bookingTime: { type: Date, default: Date.now },
});

const RouteSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Driver' },
  routeName: { type: String, required: true },
  startLocation: { type: String, required: true },
  endLocation: { type: String, required: true },
  fare: { type: Number, required: true },
  bookings: [bookingSchema],
  createdAt: { type: Date, default: Date.now },
});



module.exports = mongoose.model('TaxiRoute', RouteSchema);
