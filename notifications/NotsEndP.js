const NotsEndP = require('express').Router()
const NotificationService = require('../notifications/NotificationServices')
const User = require('../models/UserModel')
const Notification = require('../models/NotificationModel')
const verify = require('../middleware/verify')


NotsEndP.post('/update-fcm-token', verify, async (req, res) => {
    try {
        const { fcmToken, platform } = req.body;
        await NotificationService.updateUserFCMToken(req.user.id, fcmToken, platform);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update FCM token' });
    }
});


module.exports = NotsEndP