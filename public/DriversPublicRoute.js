const DriversPublicRoute = require('express').Router()
const User = require('../models/UserModel')
const Driver = require('../models/DriverModel')
const asyncHandler = require('express-async-handler')


DriversPublicRoute.get('/taxis_show_all', asyncHandler(async(req, res) => {

    try {

        const taxis = await Driver.find().sort({_id: -1})

        res.json({taxis})

        
    } catch (error) {
        res.json({msg: `there was an error while fetching users: ${error.message}`})
    }

}))


DriversPublicRoute.get('/drivers_show_all', asyncHandler(async(req, res) => {

    try {

        const drivers = await User.find({role: 11}).sort({_id: -1})

        res.json({drivers})

        
    } catch (error) {
        res.json({msg: `there was an error while fetching users: ${error.message}`})
    }

}))



module.exports = DriversPublicRoute
