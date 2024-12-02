const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    userPhoto: {
        type: String,
        default: null
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: Number,
        default: 0
    },
    userLocation: {
        type: String,
        default: null
    },
    passwordResetCode: {
        type: Number, // For a numeric reset code
        default: null
    },
    passwordResetCodeExpires: {
        type: Date, // Stores the expiration time as a Date object
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
