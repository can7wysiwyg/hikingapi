const mongoose = require('mongoose')

const MainAdminSchema = mongoose.Schema({

fullname: {
    type: String,
    unique: true,
    required: true
},
email: {
    type: String,
    unique: true,
    required: true
},
password: {
    type: String,
    unique: true,
    required: true
},
super: {
    type: Number,
    default: 18
}


}, {timestamps: true})


module.exports = mongoose.model('MainAdmin', MainAdminSchema)