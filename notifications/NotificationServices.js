const admin = require('firebase-admin');
const User = require('../models/UserModel');
const Notification = require('../models/NotificationModel')


class NotificationService {
    static async sendNotification(userId, title, body, data = {}) {
        try {
            // Get user's FCM token
            const user = await User.findById(userId);
            if (!user || !user.fcmToken) {
                console.log('No FCM token found for user:', userId);
                return false;
            }

            const message = {
                notification: {
                    title,
                    body
                },
                data,
                token: user.fcmToken
            };

            // Send notification
            const response = await admin.messaging().send(message);

            // Save notification to history
            await new Notification({
                recipient: userId,
                type: data.type || 'system',
                title,
                body,
                data
            }).save();

            return response;
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    }

    static async updateUserFCMToken(userId, token, platform) {
        try {
            await User.findByIdAndUpdate(userId, {
                fcmToken: token,
                devicePlatform: platform
            });
            return true;
        } catch (error) {
            console.error('Error updating FCM token:', error);
            throw error;
        }
    }
}

module.exports = NotificationService;
