const AdminTaxisRoute = require('express').Router()
const Ride = require('../models/RideModel')
const verifyMainAdmin = require('../adminmiddleware/verifyMainAdmin')
const mainAdmin = require('../adminmiddleware/mainAdmin')



AdminTaxisRoute.get('/admin_all_private_taxis', verifyMainAdmin, mainAdmin, async(req, res) => {

    try {
        const allPrivate = await Ride.find().sort({_id: -1})

        res.json(allPrivate)
        
    } catch (error) {
        res.json({msg: `try again later`})
    }

})


AdminTaxisRoute.get('/admin_all_private_taxi_type_by_enum', verifyMainAdmin, mainAdmin, async(req, res) => {

try {
    const {status} = req.query

    const privateTaxis = await Ride.find({rideStatus: status })

    res.json(privateTaxis)
    
} catch (error) {
    res.json({msg: `try again later`})
}


})

module.exports = AdminTaxisRoute