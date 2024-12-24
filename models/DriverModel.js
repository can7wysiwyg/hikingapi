const mongoose = require('mongoose')

const DriverSchema = mongoose.Schema({

    driverName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    driverCarPlate: {
        type: String,
        required: true
    },
    driverCarCapacity: {
        type: String,
        required: true

    },
    driverCarPhoto: {
        type: String,
        required: true
    },
    vehicleType: {
        type: String,
        enum: ['bus', 'taxi'],
        required: true, 
      },
      taxiType: {
        type: String,
        enum: ['shared', 'non-shared'],
        required: true,

      },

      idPhotoFront: {
        type: String,
        required: true
    },

    idPhotoBack: {
        type: String,
        required: true
    },

    drivingLicence: {
        type: String,
        required: true


    },

    approvedItem: {
        type: boolean,
        default: false
        
    }

  


}, {
    timestamps: true
})


module.exports = mongoose.model('Driver', DriverSchema)
