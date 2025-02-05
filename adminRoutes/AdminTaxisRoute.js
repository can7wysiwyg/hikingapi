const AdminTaxisRoute = require('express').Router()
const Ride = require('../models/RideModel')
const SharedTaxiBooking = require('../models/SharedTaxiBooking')
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


AdminTaxisRoute.get('/admin_private_taxi_single/:id', verifyMainAdmin, mainAdmin,  async(req, res) => {

try {
    const {id}  = req.params

    const singlePrivateTaxi = await Ride.findById(id)

    res.json(singlePrivateTaxi)
    
} catch (error) {
    res.json({msg: "there was a problem"})
}


})


// shared

AdminTaxisRoute.get('/admin_shared_taxis', verifyMainAdmin, mainAdmin, async(req, res) => {

try {

    const sharedTaxis = await SharedTaxiBooking.find().sort({_id: -1})

    res.json(sharedTaxis)
    
} catch (error) {
    res.json({msg: "there was a problem"})
}

})

module.exports = AdminTaxisRoute