const mongoose = require('mongoose');


const LocationSchema = new mongoose.Schema({
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] }, // [longitude, latitude]
  },
  placeName: { type: String, }, // Should match the frontend's 'placeName' key
});

const RouteSchema = new mongoose.Schema({
  taxiId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Driver' },
  routeName: { type: String },
  destinationArea: {
    type: String,
  },
  startLocation: { type: LocationSchema },
  endLocation: { type: LocationSchema },
  fare: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

RouteSchema.index({ 'endLocation.coordinates': '2dsphere' });
RouteSchema.index({ 'startLocation.coordinates': '2dsphere' });


module.exports = mongoose.model('TaxiRoute', RouteSchema)