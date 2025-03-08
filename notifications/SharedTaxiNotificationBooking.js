const User = require('../models/UserModel');
const Driver = require('../models/DriverModel');
const { driverApp, passengerApp } = require('./FirebaseInitialization');  // Update the path as needed

class SharedTaxiNotificationServices {
  static async sendSharedTaxiNotification(driverId, newBooking) {
    try {
      // Fetch driver details
      
      const getDriver = await Driver.findOne({_id: driverId});
      
      const driver = await User.findById(getDriver.driverName);

      
      if (!driver) {
        throw new Error('Driver not found in the database');
      }

      // Fetch user details
      const user = await User.findById(newBooking.userId);
            if (!user) {
        throw new Error('User not found in the database');
      }

      // Send notification to the driver
      await this.sendNotificationToDriver(driver, newBooking);
      
      // Send notification to the user
      await this.sendNotificationToUser(user, newBooking, driverId);

      
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
