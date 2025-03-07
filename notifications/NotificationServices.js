
// const { GoogleAuth } = require('google-auth-library');
// const ServiceAccount = require('../firbase-service-key.json');
// const axios = require('axios');
// const User = require('../models/UserModel');

// // Firebase Cloud Messaging (FCM) function to send notifications
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
//                         title: `Message from ${sender?.fullname}`,
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

//             // Generate the FCM access token using the google-auth-library
//             const auth = new GoogleAuth({
//                 credentials: ServiceAccount,
//                 scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
//             });

//             const token = await auth.getAccessToken();

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








const axios = require('axios');
const User = require('../models/UserModel');
const { driverApp, passengerApp } = require('./FirebaseInitialization'); // Update the path as needed

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
            
            // Determine if receiver is a driver or passenger
            const isDriver = userFind.userType === 'driver'; // Adjust this condition based on how you identify drivers
            
            // Create notification payload
            const notificationPayload = {
                token: receiverFCMToken,
                notification: {
                    title: `Message from ${sender?.fullname}`,
                    body: content.substring(0, 100), // Truncate content if needed
                },
                data: {

                    ustomData: JSON.stringify({
                                                    type: 'message',
                                                     conversationId,
                                                     messageId,
                                                     senderId
                                             })


                    // type: 'message',
                    // conversationId: conversationId,
                    // messageId: messageId,
                    // senderId: senderId


                }
            };

            // Add platform-specific configurations
            if (devicePlatform === 'ios') {
                notificationPayload.apns = {
                    payload: {
                        aps: {
                            sound: 'default',
                        },
                    },
                };
            } else if (devicePlatform === 'android') {
                notificationPayload.android = {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                    },
                };
            }

            // Choose the appropriate Firebase app based on recipient type
            const app = isDriver ? driverApp : passengerApp;
            
            // Send notification using the Firebase Admin SDK
            const response = await app.messaging().send(notificationPayload);

            console.log('FCM Notification sent:', response);
            return response;
        } catch (error) {
            console.error('Error sending FCM notification:', error);
            throw error;
        }
    }
}

module.exports = NotificationService;

