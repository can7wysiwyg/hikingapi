const Driver = require('../models/DriverModel');
const User = require('../models/UserModel')
const { driverApp } = require('./FirebaseInitialization');  // Path to your Firebase initialization

class TaxiSharedCancelNotification {
  static async sendTaxiSharedCancelNotification(driverId) {
    try {
     
        const driver = await Driver.findOne({_id: driverId});
              

      if (!driver) {
        throw new Error('Driver not found');
      }
      
      // Get driver user account to access FCM token
      const driverUser = await User.findById(driver.driverName);
      
      if (!driverUser || !driverUser.fcmToken) {
        throw new Error('Driver user account not found or missing FCM token');
      }
      
      
      // Create notification payload
      const notificationPayload = {
        token: driverUser.fcmToken,
        notification: {
          title: 'Ride Cancelled',
          body: `The ride has been cancelled by the passenger.`
        },
        data: {
          type: 'ride_cancelled',
          rideId: driverId.toString(),
          timestamp: new Date().toISOString()
        }
      };
      
      // Add platform-specific configurations
      if (driverUser.devicePlatform === 'ios') {
        notificationPayload.apns = {
          payload: {
            aps: {
              sound: 'default',
              category: 'RIDE_CANCELLED'
            },
          },
        };
      } else if (driverUser.devicePlatform === 'android') {
        notificationPayload.android = {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'ride_updates'
          }
        };
      }
      
      // Send notification using driver app
      const response = await driverApp.messaging().send(notificationPayload);
      
      console.log('Taxi cancellation notification sent:', response);
      return response;
    } catch (error) {
      console.error('Error sending taxi cancellation notification:', error);
      throw error;
    }
  }
}

module.exports = TaxiSharedCancelNotification;