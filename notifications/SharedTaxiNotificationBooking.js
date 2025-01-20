const { GoogleAuth } = require('google-auth-library');
const ServiceAccount = require('../firbase-service-key.json');
const axios = require('axios');
const User = require('../models/UserModel');
const Driver = require('../models/DriverModel')

class SharedTaxiNotificationServices {
    static async sendSharedTaxiNotification(driverId, newBooking) {
        try {
            // Fetch driver details
            
           
            const getDriver = await Driver.findOne({_id: driverId})

            const driver = await User.findById(getDriver.driverName);
            if (!driver) {
                throw new Error('Driver not found in the database');
            }

        

           
            // Send notification to the driver
            const driverFCMToken = driver.fcmToken;
            const notificationPayloadDriver = {
                message: {
                    token: driverFCMToken,
                    notification: {
                        title: `New shared taxi booking!`,
                        body: `Pick-up: ${newBooking.pickUpLocation}, Drop-off: ${newBooking.dropoff}.`,
                    },
                    data: {
                        customData: JSON.stringify({
                            type: 'shared_taxi_booking',
                            userId: newBooking.userId,
                            confirmationCode: newBooking.confirmationCode,
                        }),
                    },
                },
            };

            // Send notification to the user who booked
            const user = await User.findById(newBooking.userId);
            if (!user) {
                throw new Error('User not found in the database');
            }

            const userFCMToken = user.fcmToken;
            const notificationPayloadUser = {
                message: {
                    token: userFCMToken,
                    notification: {
                        title: `Your shared taxi is confirmed!`,
                        body: `Pick-up: ${newBooking.pickUpLocation}, Drop-off: ${newBooking.dropoff}.`,
                    },
                    data: {
                        customData: JSON.stringify({
                            type: 'shared_taxi_booking',
                            confirmationCode: newBooking.confirmationCode,
                            driverId,
                        }),
                    },
                },
            };

            // Generate the FCM access token
            const auth = new GoogleAuth({
                credentials: ServiceAccount,
                scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
            });

            const token = await auth.getAccessToken();

            // Send notifications
            await axios.post(
                'https://fcm.googleapis.com/v1/projects/messagingtesto/messages:send',
                notificationPayloadDriver,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            await axios.post(
                'https://fcm.googleapis.com/v1/projects/messagingtesto/messages:send',
                notificationPayloadUser,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('Shared taxi notifications sent to driver and user');
        } catch (error) {
            console.error('Error sending shared taxi notification:', error);
            throw error;
        }
    }
}

module.exports = SharedTaxiNotificationServices;
