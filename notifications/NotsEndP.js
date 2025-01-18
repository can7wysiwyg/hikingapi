const NotsEndP = require('express').Router()
const User = require('../models/UserModel')
const verify = require('../middleware/verify')

 


NotsEndP.post('/update-fcm-token', verify, async (req, res) => {
    try {

        const { fcmToken, devicePlatform } = req.body;

        if (!fcmToken || !devicePlatform) {
            return res.status(400).json({ error: 'FCM token and device platform are required' });
        }

        // Update the user's FCM token and device platform in the database
        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user.id }, // Find user by authenticated user's ID
            { fcmToken, devicePlatform }, // Update fields
            { new: true } // Return the updated user document
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: 'FCM token and device platform updated successfully',
            user: updatedUser,
        });

        


    } catch (error) {
        res.status(500).json({ error: 'Failed to update FCM token' });
    }
});


module.exports = NotsEndP