const mongoose = require('mongoose')

const ConfirmationSchema = mongoose.Schema({

    confirmationCode: {
        type: String,
        required: true,
        unique: true
    },

    rideStatus: {
        type: String,
        enum: ['requested', 'boarded', 'arrived', 'cancelled'],
        required: true,
    },
    taxiName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ride'
    }

}, {
    timestamps: true
})


module.exports = mongoose.model('ConfirmationCode', ConfirmationSchema )