// const { GoogleAuth } = require('google-auth-library');
// const ServiceAccount = require('../firbase-service-key.json');
// const axios = require('axios');
// const User = require('../models/UserModel');
// const Driver = require('../models/DriverModel')

// class SharedTaxiNotificationServices {
//     static async sendSharedTaxiNotification(driverId, newBooking) {
//         try {
//             // Fetch driver details
            
           
//             const getDriver = await Driver.findOne({_id: driverId})

//             const driver = await User.findById(getDriver.driverName);
//             if (!driver) {
//                 throw new Error('Driver not found in the database');
//             }

        

           
//             // Send notification to the driver
//             const driverFCMToken = driver.fcmToken;
//             const notificationPayloadDriver = {
//                 message: {
//                     token: driverFCMToken,
//                     notification: {
//                         title: `New shared taxi booking!`,
//                         body: `Pick-up: ${newBooking.pickUpLocation}, Drop-off: ${newBooking.dropoff}.`,
//                     },
//                     data: {
//                         customData: JSON.stringify({
//                             type: 'shared_taxi_booking',
//                             userId: newBooking.userId,
//                             confirmationCode: newBooking.confirmationCode,
//                         }),
//                     },
//                 },
//             };

//             // Send notification to the user who booked
//             const user = await User.findById(newBooking.userId);
//             if (!user) {
//                 throw new Error('User not found in the database');
//             }

//             const userFCMToken = user.fcmToken;
//             const notificationPayloadUser = {
//                 message: {
//                     token: userFCMToken,
//                     notification: {
//                         title: `Your shared taxi is confirmed!`,
//                         body: `Pick-up: ${newBooking.pickUpLocation}, Drop-off: ${newBooking.dropoff}.`,
//                     },
//                     data: {
//                         customData: JSON.stringify({
//                             type: 'shared_taxi_booking',
//                             confirmationCode: newBooking.confirmationCode,
//                             driverId,
//                         }),
//                     },
//                 },
//             };

//             // Generate the FCM access token
//             const auth = new GoogleAuth({
//                 credentials: ServiceAccount,
//                 scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
//             });

//             const token = await auth.getAccessToken();

//             // Send notifications
//             await axios.post(
//                 'https://fcm.googleapis.com/v1/projects/messagingtesto/messages:send',
//                 notificationPayloadDriver,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         'Content-Type': 'application/json',
//                     },
//                 }
//             );

//             await axios.post(
//                 'https://fcm.googleapis.com/v1/projects/messagingtesto/messages:send',
//                 notificationPayloadUser,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         'Content-Type': 'application/json',
//                     },
//                 }
//             );

//             console.log('Shared taxi notifications sent to driver and user');
//         } catch (error) {
//             console.error('Error sending shared taxi notification:', error);
//             throw error;
//         }
//     }
// }

// module.exports = SharedTaxiNotificationServices;













// const { GoogleAuth } = require('google-auth-library');
// const axios = require('axios');
// const User = require('../models/UserModel');
// const Driver = require('../models/DriverModel');

// // Import both service account files
// const PassengerServiceAccount = require('../kalichangupassenger.json');
// const DriverServiceAccount = require('../kalichangudriver.json');

// class SharedTaxiNotificationServices {
//     static async sendSharedTaxiNotification(driverId, newBooking) {
//         try {
//             // Fetch driver details
//             console.log("driver", driverId)
//             const getDriver = await Driver.findOne({_id: driverId});
//             const driver = await User.findById(getDriver.driverName);
//             if (!driver) {
//                 throw new Error('Driver not found in the database');
//             }

//             // Fetch user details
//             const user = await User.findById(newBooking.userId);
//             if (!user) {
//                 throw new Error('User not found in the database');
//             }

//             // Send notification to the driver using driver app credentials
//             await this.sendNotificationToDriver(driver, newBooking, driverId);
            
//             // Send notification to the user using passenger app credentials
//             await this.sendNotificationToUser(user, newBooking, driverId);

//             console.log('Shared taxi notifications sent to driver and user');
//         } catch (error) {
//             console.error('Error sending shared taxi notification:', error);
//             throw error;
//         }
//     }

//     static async sendNotificationToDriver(driver, newBooking, driverId) {
//         const driverFCMToken = driver.fcmToken;
//         const notificationPayloadDriver = {
//             message: {
//                 token: driverFCMToken,
//                 notification: {
//                     title: `New shared taxi booking!`,
//                     body: `Pick-up: ${newBooking.pickUpLocation}, Drop-off: ${newBooking.dropoff}.`,
//                 },
//                 data: {
//                     customData: JSON.stringify({
//                         type: 'shared_taxi_booking',
//                         userId: newBooking.userId,
//                         confirmationCode: newBooking.confirmationCode,
//                     }),
//                 },
//             },
//         };

//         // Get credentials for driver app
//         const auth = new GoogleAuth({
//             credentials: DriverServiceAccount,
//             scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
//         });

//         const token = await auth.getAccessToken();

//         // Use the driver app project ID from the service account
//         const projectId = DriverServiceAccount.project_id;

//         // Send notification
//         await axios.post(
//             `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
//             notificationPayloadDriver,
//             {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             }
//         );
//     }

//     static async sendNotificationToUser(user, newBooking, driverId) {
//         const userFCMToken = user.fcmToken;
//         const notificationPayloadUser = {
//             message: {
//                 token: userFCMToken,
//                 notification: {
//                     title: `Your shared taxi is confirmed!`,
//                     body: `Pick-up: ${newBooking.pickUpLocation}, Drop-off: ${newBooking.dropoff}.`,
//                 },
//                 data: {
//                     customData: JSON.stringify({
//                         type: 'shared_taxi_booking',
//                         confirmationCode: newBooking.confirmationCode,
//                         driverId,
//                     }),
//                 },
//             },
//         };

//         // Get credentials for passenger app
//         const auth = new GoogleAuth({
//             credentials: PassengerServiceAccount,
//             scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
//         });

//         const token = await auth.getAccessToken();

//         // Use the passenger app project ID from the service account
//         const projectId = PassengerServiceAccount.project_id;

//         // Send notification
//         await axios.post(
//             `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
//             notificationPayloadUser,
//             {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             }
//         );
//     }
// }

// module.exports = SharedTaxiNotificationServices;



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
