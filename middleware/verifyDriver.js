const User = require('../models/UserModel')
const asyncHandler = require('express-async-handler')

const verifyDriver = asyncHandler(async(req, res, next) => {
    try {

        const driver = await User.findOne({
            _id: req.user.id
        })
    
    
        
    
        if(driver.role !== 11 ) return res.json({msg: "you are not a driver"})
    
        next()
    
        
    } catch (error) {

        res.json({msg: `there was a problem: ${error.message}`})
        
    }

    

})

module.exports = verifyDriver