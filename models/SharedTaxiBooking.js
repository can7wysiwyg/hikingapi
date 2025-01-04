const mongoose = require('mongoose');

const SharedTaxiBookingSchema = mongoose.Schema(
    {
        driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
        taxiCapacity: { type: Number, required: true }, // Max number of passengers
        bookings: [
            {
                confirmationCode: { type: String, required: true, unique: true },
                userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
                pickUpLocation: { type: String, required: true },
                dropoff: { type: String, required: true },
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('SharedTaxiBooking', SharedTaxiBookingSchema);
