const mongoose = require('mongoose');


const RouteSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Driver' },
  routeName: { type: String, required: true },
  startLocation: { type: String, required: true },
  endLocation: { type: String, required: true },
  fare: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});



module.exports = mongoose.model('TaxiRoute', RouteSchema);
