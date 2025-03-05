const TripCountRoute = require('express').Router()
const TripCount = require('../models/TripCountModel')
const verify = require('../middleware/verify')
const verifyDriver = require('../middleware/verifyDriver')

// , verify, verifyDriver

TripCountRoute.get('/show_trips_to_owner/:id', verify, verifyDriver, async(req, res) => {


    try {

        const {id} = req.params

        const trip = await TripCount.findOne({owner: id})

        console.log(trip.tripNumber)

        res.json({trip})
        
    } catch (error) {
        console.log(error)
        res.json({msg: "try again later"})
    }


})


module.exports = TripCountRoute