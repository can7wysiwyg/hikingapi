const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const MainAdmin = require('../models/MainAdminModel')

const verifyMainAdmin = asyncHandler(async (req, res, next) => {
  let supertoken

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      supertoken = req.headers.authorization.split(' ')[1]

      // Verify token
      const decoded = jwt.verify(supertoken, process.env.ACCESS_TOKEN_MAIN_ADMIN)

      // Get user from the token
      req.super = await MainAdmin.findById(decoded.id).select('-password')

      next()
    } catch (error) {
      console.log(error)
      res.status(401)
      throw new Error('Not authorized')
    }
  }

  if (!supertoken) {
    res.status(401)
    throw new Error('Not authorized, no token')
  }
})

module.exports = verifyMainAdmin 


