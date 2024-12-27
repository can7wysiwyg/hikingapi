const mongoose = require("mongoose");

const PanicAlertSchema = new mongoose.Schema({
  type: { type: String, required: true },
  driverId: { type: String, required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  timestamp: { type: Date, required: true },
});

module.exports = mongoose.model("PanicAlert", PanicAlertSchema);
