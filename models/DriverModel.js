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

    location: {
        type: {
          type: String, // "type" must be "Point"
          enum: ['Point'],
          required: true,
        },
        coordinates: {
          type: [Number], // Array of numbers: [longitude, latitude]
          required: true,
        },
      },
  

     
          lastUpdated: { type: Date },

    
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

      

    drivingLicence: {
        type: String,
        required: true


    },

    approvedItem: {
        type: Boolean,
        default: false
        
    }

  


}, {
    timestamps: true
})

DriverSchema.index({ location: '2dsphere' });



module.exports = mongoose.model('Driver', DriverSchema)
