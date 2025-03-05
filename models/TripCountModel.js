const mongoose = require('mongoose')

const TripCountSchema = mongoose.Schema({

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver'
    },
    tripNumber: {
        type: Number,
        default: 0

    }

},
    {
        timestamps: true
    }
)


module.exports = mongoose.model('TripCount', TripCountSchema)