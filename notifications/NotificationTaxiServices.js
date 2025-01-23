const { GoogleAuth } = require('google-auth-library');
const ServiceAccount = require('../firbase-service-key.json');
const axios = require('axios');
const User = require('../models/UserModel');
const Driver = require('../models/DriverModel')


class NotificationTaxiServices {
    static async sendTaxiNotification( rideDetails, type = 'non-shared') {
        try {
            // Fetch receiver details (user or driver)
              const getDriver = await Driver.findOne({_id: rideDetails.driverId})

            
            
            const userFind = await User.findById(getDriver.driverName);
            if (!userFind) {
                throw new Error('Receiver not found in the database');
            }

            const getTaxiBooker = await User.findById(rideDetails.userId)

            // get pickup location

            // const  addressName = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            //     params: {
            //       lat: rideDetails.pickupCoordinates.latitude,        // Latitude
            //       lon: rideDetails.pickupCoordinates.longitude,       // Longitude
            //       format: 'json',       // Response format
            //       addressdetails: 1,    // Include address details
            //     },
            //     headers: {
            //       'User-Agent': 'YourAppName', // Set a User-Agent to identify your app
            //     },
            //   });
   
            const apiKey = '9c9c94ac-7c45-4141-8427-663723d70743';

         const addressName = await axios.get(`https://graphhopper.com/api/1/geocode?point=${rideDetails.pickupCoordinates.latitude},${rideDetails.pickupCoordinates.longitude}&reverse=true&key=${apiKey}`)   

             const data = addressName.data.address




console.log("here is my address..", data)





           
           
                    

            const receiverFCMToken = userFind.fcmToken;
            const devicePlatform = userFind.devicePlatform; // 'ios', 'android', or 'web'

            // Customize the notification payload
            const notificationPayload = {
                message: {
                    token: receiverFCMToken,
                    notification: {
                        title: `${getTaxiBooker.fullname} booked Your ${type} taxi!`,
                        body: `Dropoff: ${rideDetails.dropoffLocation}. Distance: ${rideDetails.distance} km.`,
                    },
                    data: {
                        customData: JSON.stringify({
                            type: 'taxi_booking',
                            rideId: rideDetails._id,
                            rideStatus: rideDetails.rideStatus,
                            confirmationCode: rideDetails.confirmationCode,
                        }),
                    },
                },
            };

            // Add platform-specific configurations
            if (devicePlatform === 'ios') {
                notificationPayload.message.notification.sound = 'default';
            } else if (devicePlatform === 'android') {
                notificationPayload.message.android = {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                    },
                };
            }

            // Generate the FCM access token
            const auth = new GoogleAuth({
                credentials: ServiceAccount,
                scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
            });

            const token = await auth.getAccessToken();

            // Send the notification to FCM
            const response = await axios.post(
                'https://fcm.googleapis.com/v1/projects/messagingtesto/messages:send',
                notificationPayload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('Taxi booking notification sent:', response.data);
        } catch (error) {
            console.error('Error sending taxi booking notification:', error);
            throw error;
        }
    }
}


module.exports = NotificationTaxiServices