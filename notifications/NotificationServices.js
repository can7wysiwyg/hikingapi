// const admin = require('firebase-admin');
// const User = require('../models/UserModel');

// const axios = require('axios');
// const  generateAccessToken  = require('./authService'); // You should have this utility to generate a token for FCM

// // Firebase Cloud Messaging (FCM) function to send notifications
// class NotificationService {
//     static async sendFCMNotification(receiver, sender, content, conversationId, messageId, senderId) {
//         try {
//             // if (!receiver.fcmToken) {
//             //     throw new Error('Receiver does not have an FCM token');
//             // }


//             const receiverId = receiver._id.toString(); // Ensure it's a string
            
//             // Find receiver details in the database
//             const userFind = await User.findOne({ _id: receiverId });
//             if (!userFind) {
//                 throw new Error('Receiver not found in the database');
//             }

           


//             const receiverFCMToken = userFind.fcmToken;
//             const devicePlatform = userFind.devicePlatform; // 'ios', 'android', or 'web'

//             const notificationPayload = {
//                 message: {
//                     token: receiverFCMToken,
//                     notification: {
//                         title: `Message from ${sender}`,
//                         body: content.substring(0, 100), // Truncate content if needed
//                     },
//                     data: {
//                         customData: JSON.stringify({
//                             type: 'message',
//                             conversationId,
//                             messageId,
//                             senderId
//                         })
//                     }
//                 }
//             };

//             // Add platform-specific configurations (optional)
//             if (devicePlatform === 'ios') {
//                 notificationPayload.message.notification.sound = 'default';
//             } else if (devicePlatform === 'android') {
//                 notificationPayload.message.android = {
//                     priority: 'high',
//                     notification: {
//                         sound: 'default'
//                     }
//                 };
//             }

//             // Get the access token for the FCM request
//             const userId = receiverId
//             const token = await generateAccessToken(userId);

//             // Send the notification request to FCM
//             const response = await axios.post(
//                 'https://fcm.googleapis.com/v1/projects/messagingtesto/messages:send',
//                 notificationPayload,
//                 {
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json',
//                     },
//                 }
//             );

//             console.log('FCM Notification sent:', response.data);
//         } catch (error) {
//             console.error('Error sending FCM notification:', error);
//             throw error;
//         }
//     }
// }



// module.exports = NotificationService;



const User = require('../models/UserModel');
const axios = require('axios');

// Initialize Firebase Admin SDK

// Firebase Cloud Messaging (FCM) function to send notifications
// class NotificationService {
//     static async sendFCMNotification(receiver, sender, content, conversationId, messageId, senderId) {
//         try {
//             const receiverId = receiver._id.toString(); // Ensure it's a string
            
//             // Find receiver details in the database
//             const userFind = await User.findOne({ _id: receiverId });
//             if (!userFind) {
//                 throw new Error('Receiver not found in the database');
//             }

//             const receiverFCMToken = userFind.fcmToken;
//             const devicePlatform = userFind.devicePlatform; // 'ios', 'android', or 'web'

//             const notificationPayload = {
//                 message: {
//                     token: receiverFCMToken,
//                     notification: {
//                         title: `Message from ${sender}`,
//                         body: content.substring(0, 100), // Truncate content if needed
//                     },
//                     data: {
//                         customData: JSON.stringify({
//                             type: 'message',
//                             conversationId,
//                             messageId,
//                             senderId
//                         })
//                     }
//                 }
//             };

//             // Add platform-specific configurations (optional)
//             if (devicePlatform === 'ios') {
//                 notificationPayload.message.notification.sound = 'default';
//             } else if (devicePlatform === 'android') {
//                 notificationPayload.message.android = {
//                     priority: 'high',
//                     notification: {
//                         sound: 'default'
//                     }
//                 };
//             }

            
//             // Send the notification request to FCM
//             const response = await axios.post(
//                 'https://fcm.googleapis.com/v1/projects/messagingtesto/messages:send',
//                 notificationPayload,
//                 {
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json',
//                     },
//                 }
//             );

//             console.log('FCM Notification sent:', response.data);
//         } catch (error) {
//             console.error('Error sending FCM notification:', error);
//             throw error;
//         }
//     }
// }

// module.exports = NotificationService;







const { GoogleAuth } = require('google-auth-library');
const ServiceAccount = require('../firbase-service-key.json');
const axios = require('axios');
const User = require('../models/UserModel');

// Firebase Cloud Messaging (FCM) function to send notifications
class NotificationService {
    static async sendFCMNotification(receiver, sender, content, conversationId, messageId, senderId) {
        try {
            const receiverId = receiver._id.toString(); // Ensure it's a string
            
            // Find receiver details in the database
            const userFind = await User.findOne({ _id: receiverId });
            if (!userFind) {
                throw new Error('Receiver not found in the database');
            }

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

            // Generate the FCM access token using the google-auth-library
            const auth = new GoogleAuth({
                credentials: ServiceAccount,
                scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
            });

            const token = await auth.getAccessToken();

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

