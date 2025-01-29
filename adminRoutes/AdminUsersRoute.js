const AdminUsersRoute = require('express').Router()
const User = require('../models/UserModel')
const verifyMainAdmin = require('../adminmiddleware/verifyMainAdmin')
const mainAdmin = require('../adminmiddleware/mainAdmin')
const asyncHandler = require('express-async-handler')

AdminUsersRoute.get('/admin_show_all_users', verifyMainAdmin, mainAdmin,  asyncHandler(async (req, res) => {
    try {
      
      const users = await User.find().sort({_id: -1})
  
      res.json(users); 
    } catch (error) {
      res.status(500).json({ msg: `There was an error in getting the users: ${error.message}` });
    }
  }));


  AdminUsersRoute.get('/admin_show_user/:id', verifyMainAdmin, mainAdmin, asyncHandler(async(req, res) => {

try {

  const {id} = req.params

  const user = await User.findOne({_id: id})


  res.json(user)

  

  
} catch (error) {

  res.status(500).json({ msg: `There was an error in getting the users: ${error.message}` });
  
}

  }) )






module.exports = AdminUsersRoute