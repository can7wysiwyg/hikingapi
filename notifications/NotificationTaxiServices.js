
// const admin = require('firebase-admin');
// const User = require('../models/UserModel');
// const Driver = require('../models/DriverModel');

// // Initialize Firebase apps with different service accounts
// const driverApp = admin.initializeApp({
//   credential: admin.credential.cert(require('../kalichangudriver.json'))
// }, 'driver-app');

// const passengerApp = admin.initializeApp({
//   credential: admin.credential.cert(require('../kalichangupassenger.json'))
// }, 'passenger-app');


// class NotificationTaxiServices {


// }
















// // const { GoogleAuth } = require('google-auth-library');
// // const ServiceAccount = require('../firbase-service-key.json');
// // const axios = require('axios');
// // const User = require('../models/UserModel');
// // const Driver = require('../models/DriverModel')


// class NotificationTaxiServices {
//     static async sendTaxiNotification( rideDetails, type = 'non-shared') {
//         try {
//             // Fetch receiver details (user or driver)
//               const getDriver = await Driver.findOne({_id: rideDetails.driverId})

            
            
//             const userFind = await User.findById(getDriver.driverName);
//             if (!userFind) {
//                 throw new Error('Receiver not found in the database');
//             }

//             const getTaxiBooker = await User.findById(rideDetails.userId)

//             // get pickup location

            
//             const apiKey = '9c9c94ac-7c45-4141-8427-663723d70743';

//          const addressName = await axios.get(`https://graphhopper.com/api/1/geocode?point=${rideDetails.pickupCoordinates.latitude},${rideDetails.pickupCoordinates.longitude}&reverse=true&key=${apiKey}`)   

//              const data = addressName.data.hits[0];

           
           
                    

//             const receiverFCMToken = userFind.fcmToken;
//             const devicePlatform = userFind.devicePlatform; // 'ios', 'android', or 'web'

//             // Customize the notification payload
//             const notificationPayload = {
//                 message: {
//                     token: receiverFCMToken,
//                     notification: {
//                         title: `${getTaxiBooker.fullname} booked Your ${type} taxi!`,
//                         body: `Pickup Location: ${data.name}, ${data.state}, ${data.country} .  Dropoff: ${rideDetails.dropoffLocation}. Distance: ${rideDetails.distance} km. 
//                         There details: phone number ${getTaxiBooker.phone}, email ${getTaxiBooker.email} `,
//                     },
//                     data: {
//                         customData: JSON.stringify({
//                             type: 'taxi_booking',
//                             rideId: rideDetails._id,
//                             rideStatus: rideDetails.rideStatus,
//                             confirmationCode: rideDetails.confirmationCode,
//                         }),
//                     },
//                 },
//             };

//             // Add platform-specific configurations
//             if (devicePlatform === 'ios') {
//                 notificationPayload.message.notification.sound = 'default';
//             } else if (devicePlatform === 'android') {
//                 notificationPayload.message.android = {
//                     priority: 'high',
//                     notification: {
//                         sound: 'default',
//                     },
//                 };
//             }

//             // Generate the FCM access token
//             const auth = new GoogleAuth({
//                 credentials: ServiceAccount,
//                 scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
//             });

//             const token = await auth.getAccessToken();

//             // Send the notification to FCM
//             const response = await axios.post(
//                 'https://fcm.googleapis.com/v1/projects/messagingtesto/messages:send',
//                 notificationPayload,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         'Content-Type': 'application/json',
//                     },
//                 }
//             );

//             console.log('Taxi booking notification sent:', response.data);
//         } catch (error) {
//             console.error('Error sending taxi booking notification:', error);
//             throw error;
//         }
//     }
// }


// module.exports = NotificationTaxiServices

















// const admin = require('firebase-admin');
// const User = require('../models/UserModel');
// const Driver = require('../models/DriverModel');
// const axios = require('axios');

// // Initialize Firebase apps with different service accounts
// const driverApp = admin.initializeApp({
//   credential: admin.credential.cert(require('../kalichangudriver.json'))
// }, 'driver-app');

// const passengerApp = admin.initializeApp({
//   credential: admin.credential.cert(require('../kalichangupassenger.json'))
// }, 'passenger-app');

// class NotificationTaxiServices {
//     static async sendTaxiNotification(rideDetails, type = 'non-shared') {
//         try {
//             // Fetch receiver details (driver)
//             const getDriver = await Driver.findOne({_id: rideDetails.driverId});
            
//             const userFind = await User.findById(getDriver.driverName);
//             if (!userFind) {
//                 throw new Error('Receiver not found in the database');
//             }

//             const getTaxiBooker = await User.findById(rideDetails.userId);

//             // Get pickup location
//             const apiKey = '9c9c94ac-7c45-4141-8427-663723d70743';
//             const addressName = await axios.get(
//                 `https://graphhopper.com/api/1/geocode?point=${rideDetails.pickupCoordinates.latitude},${rideDetails.pickupCoordinates.longitude}&reverse=true&key=${apiKey}`
//             );   
//             const data = addressName.data.hits[0];
                    
//             const receiverFCMToken = userFind.fcmToken;
//             const devicePlatform = userFind.devicePlatform; // 'ios', 'android', or 'web'

//             // Customize the notification payload
//             const notificationPayload = {
//                 notification: {
//                     title: `${getTaxiBooker.fullname} booked Your ${type} taxi!`,
//                     body: `Pickup Location: ${data.name}, ${data.state}, ${data.country}. Dropoff: ${rideDetails.dropoffLocation}. Distance: ${rideDetails.distance} km. 
//                     There details: phone number ${getTaxiBooker.phone}, email ${getTaxiBooker.email}`,
//                 },
//                 data: {
//                     type: 'taxi_booking',
//                     rideId: rideDetails._id.toString(),
//                     rideStatus: rideDetails.rideStatus,
//                     confirmationCode: rideDetails.confirmationCode,
//                 },
//             };

//             // Add platform-specific configurations
//             const options = {};
//             if (devicePlatform === 'ios') {
//                 options.sound = 'default';
//             } else if (devicePlatform === 'android') {
//                 options.android = {
//                     priority: 'high',
//                     notification: {
//                         sound: 'default',
//                     },
//                 };
//             }

//             // Determine which app to use based on the recipient type
//             // In this case, we're sending to a driver
//             const fcmApp = driverApp;
            
//             // Send the notification using the admin SDK
//             const response = await fcmApp.messaging().send({
//                 token: receiverFCMToken,
//                 notification: notificationPayload.notification,
//                 data: notificationPayload.data,
//                 android: options.android,
//                 apns: devicePlatform === 'ios' ? {
//                     payload: {
//                         aps: {
//                             sound: 'default',
//                         },
//                     },
//                 } : undefined,
//             });

//             console.log('Taxi booking notification sent:', response);
//             return response;
//         } catch (error) {
//             console.error('Error sending taxi booking notification:', error);
//             throw error;
//         }
//     }

//     // Add a method for passenger notifications
//     static async sendPassengerNotification(userId, driverId, rideDetails, notificationType = 'ride_accepted') {
//         try {
//             // Fetch the passenger
//             const passenger = await User.findById(userId);
//             if (!passenger || !passenger.fcmToken) {
//                 throw new Error('Passenger not found or has no FCM token');
//             }

//             // Fetch driver info
//             const driver = await Driver.findOne({_id: driverId});
//             const driverUser = await User.findById(driver.driverName);
            
//             let title, body;
            
//             switch(notificationType) {
//                 case 'ride_accepted':
//                     title = 'Your ride has been accepted!';
//                     body = `Driver ${driverUser.fullname} has accepted your ride request. Vehicle: ${driver.carModel || 'N/A'}`;
//                     break;
//                 case 'driver_arrived':
//                     title = 'Your driver has arrived';
//                     body = `${driverUser.fullname} has arrived at your pickup location.`;
//                     break;
//                 case 'ride_started':
//                     title = 'Your ride has started';
//                     body = `You're on your way to ${rideDetails.dropoffLocation}.`;
//                     break;
//                 case 'ride_completed':
//                     title = 'Ride completed';
//                     body = `You've arrived at your destination. Thank you for riding with us!`;
//                     break;
//                 default:
//                     title = 'Ride update';
//                     body = 'There is an update to your ride.';
//             }

//             const devicePlatform = passenger.devicePlatform;
            
//             // Send notification using passenger app
//             const response = await passengerApp.messaging().send({
//                 token: passenger.fcmToken,
//                 notification: {
//                     title,
//                     body
//                 },
//                 data: {
//                     type: notificationType,
//                     rideId: rideDetails._id.toString(),
//                     driverId: driverId.toString(),
//                     rideStatus: rideDetails.rideStatus
//                 },
//                 android: devicePlatform === 'android' ? {
//                     priority: 'high',
//                     notification: {
//                         sound: 'default',
//                     }
//                 } : undefined,
//                 apns: devicePlatform === 'ios' ? {
//                     payload: {
//                         aps: {
//                             sound: 'default',
//                         },
//                     },
//                 } : undefined,
//             });

//             console.log('Passenger notification sent:', response);
//             return response;
//         } catch (error) {
//             console.error('Error sending passenger notification:', error);
//             throw error;
//         }
//     }
// }

// module.exports = NotificationTaxiServices;







const admin = require('firebase-admin');
const User = require('../models/UserModel');
const Driver = require('../models/DriverModel');
const axios = require('axios');

// Initialize Firebase apps with different service accounts
const driverApp = admin.initializeApp({
  credential: admin.credential.cert(require('../kalichangudriver.json'))
}, 'driver-app');

const passengerApp = admin.initializeApp({
  credential: admin.credential.cert(require('../kalichangupassenger.json'))
}, 'passenger-app');

class NotificationTaxiServices {
    static async sendTaxiNotification(rideDetails, type = 'non-shared') {
        try {
            // Fetch receiver details (driver)
            const getDriver = await Driver.findOne({_id: rideDetails.driverId});
            
            const userFind = await User.findById(getDriver.driverName);
            if (!userFind) {
                throw new Error('Receiver not found in the database');
            }

            const getTaxiBooker = await User.findById(rideDetails.userId);

            // Get pickup location
            const apiKey = '9c9c94ac-7c45-4141-8427-663723d70743';
            const addressName = await axios.get(
                `https://graphhopper.com/api/1/geocode?point=${rideDetails.pickupCoordinates.latitude},${rideDetails.pickupCoordinates.longitude}&reverse=true&key=${apiKey}`
            );   
            const data = addressName.data.hits[0];
                    
            const receiverFCMToken = userFind.fcmToken;
            const devicePlatform = userFind.devicePlatform; // 'ios', 'android', or 'web'

            // Customize the notification payload
            const notificationPayload = {
                notification: {
                    title: `${getTaxiBooker.fullname} booked Your ${type} taxi!`,
                    body: `Pickup Location: ${data.name}, ${data.state}, ${data.country}. Dropoff: ${rideDetails.dropoffLocation}. Distance: ${rideDetails.distance} km. 
                    There details: phone number ${getTaxiBooker.phone}, email ${getTaxiBooker.email}`,
                },
                data: {
                    type: 'taxi_booking',
                    rideId: rideDetails._id.toString(),
                    rideStatus: rideDetails.rideStatus,
                    confirmationCode: rideDetails.confirmationCode,
                },
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

            // Send notification using driver app
            const response = await driverApp.messaging().send({
                token: receiverFCMToken,
                ...notificationPayload
            });

            console.log('Taxi booking notification sent:', response);
            return response;
        } catch (error) {
            console.error('Error sending taxi booking notification:', error);
            throw error;
        }
    }
}

module.exports = NotificationTaxiServices;