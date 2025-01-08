const AllUsersRoute = require('express').Router()
const verify = require('../middleware/verify')
const User = require('../models/UserModel')
const asyncHandler = require('express-async-handler')


AllUsersRoute.get('/show_all_users', verify,  asyncHandler(async (req, res) => {
    try {
      
      const users = await User.find().select('fullname _id userLocation');
  
      res.json(users); 
    } catch (error) {
      res.status(500).json({ msg: `There was an error in getting the users: ${error.message}` });
    }
  }));


  AllUsersRoute.get('/show_user/:id', verify, asyncHandler(async(req, res) => {

try {

  const {id} = req.params

  const user = await User.findOne({_id: id}).select('fullname _id userLocation');


  res.json({user})

  

  
} catch (error) {

  res.status(500).json({ msg: `There was an error in getting the users: ${error.message}` });
  
}

  }) )
  



module.exports =  AllUsersRoute
