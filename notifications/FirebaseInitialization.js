const admin = require('firebase-admin');

// Initialize Firebase apps with different service accounts
let driverApp;
let passengerApp;

try {
  driverApp = admin.app('driver-app');
} catch (error) {
  driverApp = admin.initializeApp({
    credential: admin.credential.cert(require('../kalichangudriver.json'))
  }, 'driver-app');
}

try {
  passengerApp = admin.app('passenger-app');
} catch (error) {
  passengerApp = admin.initializeApp({
    credential: admin.credential.cert(require('../kalichangupassenger.json'))
  }, 'passenger-app');
}

module.exports = {
  driverApp,
  passengerApp
};