const admin = require('firebase-admin');
const User = require('../models/UserModel');
const Driver = require('../models/DriverModel');

// Initialize Firebase apps with different service accounts
const driverApp = admin.initializeApp({
  credential: admin.credential.cert(require('../kalichangudriver.json'))
}, 'driver-app');

const passengerApp = admin.initializeApp({
  credential: admin.credential.cert(require('../kalichangupassenger.json'))
}, 'passenger-app');

class SharedTaxiNotificationServices {
  static async sendSharedTaxiNotification(driverId, newBooking) {
    try {
      // Fetch driver details

      console.log("newbooking", newBooking)

      console.log("driverId", driverId)
      const getDriver = await Driver.findOne({_id: driverId});
      console.log("getDriver", getDriver)
      const driver = await User.findById(getDriver.driverName);

      console.log("driver", driver)
      if (!driver) {
        throw new Error('Driver not found in the database');
      }

      // Fetch user details
      const user = await User.findById(newBooking.userId);
      console.log("user", user)
      if (!user) {
        throw new Error('User not found in the database');
      }

      // Send notification to the driver
      await this.sendNotificationToDriver(driver, newBooking);
      
      // Send notification to the user
      await this.sendNotificationToUser(user, newBooking, driverId);

      console.log('Shared taxi notifications sent to driver and user');
    } catch (error) {
      console.error('Error sending shared taxi notification:', error);
      throw error;
    }
  }

  static async sendNotificationToDriver(driver, newBooking) {
    const driverFCMToken = driver.fcmToken;
    
    await driverApp.messaging().send({
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
    });
  }

  static async sendNotificationToUser(user, newBooking, driverId) {
    const userFCMToken = user.fcmToken;
    
    await passengerApp.messaging().send({
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
    });
  }
}

module.exports = SharedTaxiNotificationServices;
