// const admin = require('firebase-admin');

// // Initialize Firebase Admin SDK
// if (!admin.apps.length) {
//     admin.initializeApp({
//         credential: admin.credential.cert(require('../firbase-service-key.json')),
//     });
// }


// // Generate an FCM access token
// async function generateAccessToken(userId) {
//     try {
//         const token = await admin.auth().createCustomToken(userId); // Just an example, get a real token as per your setup
//         return token;
//     } catch (error) {
//         console.error('Error generating access token:', error);
//         throw error;
//     }
// }



// module.exports = generateAccessToken


const { GoogleAuth } = require('google-auth-library');
const ServiceAccount = require('../firbase-service-key.json');

async function generateAccessToken() {
    try {
        const auth = new GoogleAuth({
            credentials: ServiceAccount,
            scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
        });

        const token = await auth.getAccessToken();
        return token;
    } catch (error) {
        console.error('Error generating access token:', error);
        throw error;
    }
}

module.exports = generateAccessToken;
