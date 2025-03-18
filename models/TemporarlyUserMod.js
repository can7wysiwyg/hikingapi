const mongoose = require('mongoose');

const temporaryUserSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  verificationCode: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // Document expires after 10 minutes
});

module.exports = mongoose.model('TemporaryUser', temporaryUserSchema);
