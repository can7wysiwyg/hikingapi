// const jwt = require('jsonwebtoken')
// const asyncHandler = require('express-async-handler')
// const User = require('../models/UserModel')

// const verify = asyncHandler(async (req, res, next) => {
//   let usertoken

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     try {
//       // Get token from header
//       usertoken = req.headers.authorization.split(' ')[1]

//       // Verify token
//       const decoded = jwt.verify(usertoken, process.env.ACCESS_TOKEN)

//       // Get user from the token
//       req.user = await User.findById(decoded.id).select('-password')

//       next()
//     } catch (error) {
//       console.log(error)
//       res.status(401)
//       throw new Error('Not authorized')
//     }
//   }

//   if (!usertoken) {
//     res.status(401)
//     throw new Error('Not authorized, no token')
//   }
// })

// module.exports = verify 



const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/UserModel');

const verify = asyncHandler(async (req, res, next) => {
  let usertoken;
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      usertoken = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(usertoken, process.env.ACCESS_TOKEN);
      
      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        res.status(401);
        throw new Error('User not found');
      }
      
      next();
    } catch (error) {
      console.log(error);
      
      // Provide more specific error message for token expiration
      if (error.name === 'TokenExpiredError') {
        res.status(401);
        throw new Error('Token expired, please log in again');
      } else {
        res.status(401);
        throw new Error('Not authorized');
      }
    }
  } else if (!usertoken) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

module.exports = verify;

