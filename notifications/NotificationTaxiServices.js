const User = require('../models/UserModel');
const Driver = require('../models/DriverModel');
const axios = require('axios');
const { driverApp } = require('./FirebaseInitialization');  // Update the path as needed

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
                    Their details: phone number ${getTaxiBooker.phone}, email ${getTaxiBooker.email}`,
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