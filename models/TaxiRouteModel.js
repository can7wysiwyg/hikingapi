const mongoose = require('mongoose');


const LocationSchema = new mongoose.Schema({
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  placeName: { type: String, required: true }, // Should match the frontend's 'placeName' key
});

const RouteSchema = new mongoose.Schema({
  taxiId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Driver' },
  routeName: { type: String, required: true },
  startLocation: { type: LocationSchema, required: true },
  endLocation: { type: LocationSchema, required: true },
  fare: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

RouteSchema.index({ 'endLocation.coordinates': '2dsphere' });
RouteSchema.index({ 'startLocation.coordinates': '2dsphere' });


module.exports = mongoose.model('TaxiRoute', RouteSchema)