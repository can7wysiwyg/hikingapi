const mongoose = require('mongoose');

const ConfirmationSchema = mongoose.Schema({
    confirmationCodes: [
        {
            confirmationCode: {
                type: String,
                required: true,
                unique: true,  // Ensure each confirmation code is unique within the list
            },
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        },
    ],
    taxiName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver', // Reference to the Driver model
        required: true,
    },
    rideStatus: {
        type: String,
        enum: ['requested', 'boarded', 'arrived', 'cancelled'],
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('ConfirmationCode', ConfirmationSchema);
