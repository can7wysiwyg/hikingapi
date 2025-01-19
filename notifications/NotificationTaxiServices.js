class NotificationTaxiServices {
    static async sendTaxiNotification(receiverId, senderName, rideDetails, type = 'non-shared') {
        try {
            // Fetch receiver details (user or driver)
            const userFind = await User.findOne({ _id: receiverId });
            if (!userFind) {
                throw new Error('Receiver not found in the database');
            }

            const receiverFCMToken = userFind.fcmToken;
            const devicePlatform = userFind.devicePlatform; // 'ios', 'android', or 'web'

            // Customize the notification payload
            const notificationPayload = {
                message: {
                    token: receiverFCMToken,
                    notification: {
                        title: `${senderName} booked a ${type} taxi!`,
                        body: `Pickup: ${rideDetails.pickupCoordinates}. Dropoff: ${rideDetails.dropoffLocation}. Distance: ${rideDetails.distance} km.`,
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
