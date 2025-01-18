const admin = require('firebase-admin');
const User = require('../models/UserModel');

const axios = require('axios');
const  generateAccessToken  = require('./authService'); // You should have this utility to generate a token for FCM

// Firebase Cloud Messaging (FCM) function to send notifications
class NotificationService {
    static async sendFCMNotification(receiver, sender, content, conversationId, messageId, senderId) {
        try {
            // if (!receiver.fcmToken) {
            //     throw new Error('Receiver does not have an FCM token');
            // }

            const userFind = await User.findOne({_id: receiver})

            console.log(receiver)



            const receiverFCMToken = userFind.fcmToken;
            const devicePlatform = userFind.devicePlatform; // 'ios', 'android', or 'web'

            const notificationPayload = {
                message: {
                    token: receiverFCMToken,
                    notification: {
                        title: `Message from ${sender}`,
                        body: content.substring(0, 100), // Truncate content if needed
                    },
                    data: {
                        customData: JSON.stringify({
                            type: 'message',
                            conversationId,
                            messageId,
                            senderId
                        })
                    }
                }
            };

            // Add platform-specific configurations (optional)
            if (devicePlatform === 'ios') {
                notificationPayload.message.notification.sound = 'default';
            } else if (devicePlatform === 'android') {
                notificationPayload.message.android = {
                    priority: 'high',
                    notification: {
                        sound: 'default'
                    }
                };
            }

            // Get the access token for the FCM request
            const userId = receiver
            const token = await generateAccessToken(userId);

            // Send the notification request to FCM
            const response = await axios.post(
                'https://fcm.googleapis.com/v1/projects/messagingtesto/messages:send',
                notificationPayload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('FCM Notification sent:', response.data);
        } catch (error) {
            console.error('Error sending FCM notification:', error);
            throw error;
        }
    }
}



module.exports = NotificationService;
