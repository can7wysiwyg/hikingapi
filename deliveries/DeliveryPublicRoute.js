const DeliverPublicRoute = require('express').Router()
const Delivery = require('../models/DeliveryCarModel')
const asyncHandler = require('express-async-handler')


DeliverPublicRoute.get('/show_deliver_cars', asyncHandler(async(req, res) => {


    try {

        const cars = await Delivery.find().sort({_id: -1})

        res.json(cars)
        
    } catch (error) {
        res.json({msg: "there was a problem while displaying this data"})
    }

}))


module.exports = DeliverPublicRoute
