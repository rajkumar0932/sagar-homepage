// File: /api/lib/firebaseAdmin.js
// This file handles the Firebase Admin connection, ensuring it only happens once.

const admin = require('firebase-admin');

// Check if the app is already initialized to prevent errors.
if (!admin.apps.length) {
  try {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (!serviceAccountBase64) {
      throw new Error('Firebase service account key environment variable is not set.');
    }
    // Decode the Base64 string to a JSON object.
    const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
    // Throwing the error here will cause the function to fail cleanly
    // if Firebase can't be initialized, which is better than silent failures.
    throw new Error('Could not initialize Firebase Admin SDK.');
  }
}

// Export the initialized Firestore instance to be used by other functions.
export const db = admin.firestore();