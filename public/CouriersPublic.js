const CouriersPublic = require('express').Router()
const Courier = require('../models/CourierModel')
const asyncHandler = require('express-async-handler')


CouriersPublic.get('/show_couriers', asyncHandler(async(req, res) => {

    try {

        const couriers = await Courier.find()

        res.json({couriers})


        
    } catch (error) {
        res.json({msg: `there was a problem in fetching Couriers: ${error.message}`})
    }


}))



CouriersPublic.get('/show_courier/:id', asyncHandler(async(req, res) => {

    try {

        const {id} = req.params

        const courier = await Courier.findById(id)

        res.json({courier})


        
    } catch (error) {
        res.json({msg: `there was a problem in fetching Courier: ${error.message}`})
    }


}))




module.exports = CouriersPublic