const UserFirstRoute = require('express').Router()
const User = require('../models/UserModel')
const verify = require('../middleware/verify')


UserFirstRoute.post('/user_first_time', verify, async (req, res) => {
    try {
      const userId = req.user.id; // Assuming you're using authentication middleware
      const user = await User.findById(userId);
  
      if (user) {
        user.isFirstTimeUser = false; // Update the flag
        await user.save();
        return res.status(200).json({ message: 'User status updated successfully.' });
      }
  
      return res.status(404).json({ message: 'User not found.' });
    } catch (error) {
      return res.status(500).json({ message: 'Server error.', error });
    }
  }
  )  




module.exports = UserFirstRoute

