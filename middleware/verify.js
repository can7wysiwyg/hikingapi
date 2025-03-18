const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/UserModel')

const verify = asyncHandler(async (req, res, next) => {
  let usertoken

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      usertoken = req.headers.authorization.split(' ')[1]

      // Verify token
      const decoded = jwt.verify(usertoken, process.env.ACCESS_TOKEN)

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password')

      next()
    } catch (error) {
      console.log(error)
      res.status(401)
      console.log('Not authorized')
    }
  }

  if (!usertoken) {
    
    console.log('Not authorized, no token')
  }
})

module.exports = verify 



