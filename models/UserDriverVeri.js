const mongoose = require('mongoose')

const UserDriverVerificationSchema = mongoose.Schema({

    idPhotoFront: {
        type: String,
        required: true
    },

    idPhotoBack: {
        type: String,
        required: true
    },
    userName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
    



}, {
    timestamps: true
})


module.exports = mongoose.model('DriverVeri', UserDriverVerificationSchema)

