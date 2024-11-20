const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const Admin = require('../models/AdminModel')

const verifyAdmin = asyncHandler(async (req, res, next) => {
  let librarianToken

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      librarianToken = req.headers.authorization.split(' ')[1]

      // Verify token
      const decoded = jwt.verify(librarianToken, process.env.ACCESS_TOKEN_ADMIN)

      // Get user from the token
      req.admin = await Admin.findById(decoded.id).select('-password')

      next()
    } catch (error) {
      console.log(error)
      res.status(401)
      throw new Error('Not authorized')
    }
  }

  if (!librarianToken) {
    res.status(401)
    throw new Error('Not authorized, no token')
  }
})

module.exports = verifyAdmin 


