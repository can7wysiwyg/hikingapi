const User = require('../models/UserModel');
const Driver = require('../models/DriverModel');
const Ride = require('../models/RideModel');
const axios = require('axios');
const { driverApp } = require('./FirebaseInitialization');  // Path to your Firebase initialization

class TaxiPrivateCancelNotification {
  static async sendTaxiPrivateCancelNotification(taxiId) {
    try {
      // Get ride details
      console.log("taxiid", taxiId)
      const rideDetails = await Ride.findOne({_id: taxiId});

      console.log("rideDetails", rideDetails)
      if (!rideDetails) {
        throw new Error('Ride not found');
      }
      
      // Get driver details
      const driver = await Driver.findOne({_id: rideDetails.driverId});
      console.log("DRIVER", driver)
      if (!driver) {
        throw new Error('Driver not found');
      }
      
      // Get driver user account to access FCM token
      const driverUser = await User.findById(driver.driverName);
      console.log("driveruser", driverUser)
      if (!driverUser || !driverUser.fcmToken) {
        throw new Error('Driver user account not found or missing FCM token');
      }
      
      // Get user who booked the taxi
      const booker = await User.findById(rideDetails.userId);
      console.log("booker", "booker")
      const bookerName = booker ? booker.fullname : 'A customer';
      
      // Create notification payload
      const notificationPayload = {
        token: driverUser.fcmToken,
        notification: {
          title: 'Ride Cancelled',
          body: `${bookerName} has cancelled their taxi booking (ID: ${rideDetails.confirmationCode || taxiId.substring(0, 8)})`
        },
        data: {
          type: 'ride_cancelled',
          rideId: taxiId.toString(),
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

module.exports = TaxiPrivateCancelNotification;