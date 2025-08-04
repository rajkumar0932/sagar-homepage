// File: /api/cron.js
// This is a serverless function that you can set up as a cron job.
// On Vercel, you can add a "crons" section to your vercel.json file.
// Example vercel.json:
// {
//   "crons": [
//     {
//       "path": "/api/cron",
//       "schedule": "*/15 * * * *"
//     }
//   ]
// }
// This will run the function every 15 minutes.

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// --- IMPORTANT: Firebase Admin SDK Setup ---
// You need to create a service account in your Firebase project settings
// and add the credentials as environment variables to your hosting provider (e.g., Vercel).
// DO NOT commit the service account key to your repository.
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
} catch (e) {
  console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it is set correctly in your environment variables.');
  // Exit gracefully if the key is not available.
  // This prevents crashes during local development if the key isn't set.
  serviceAccount = null;
}


// Initialize Firebase Admin only once
if (serviceAccount && !getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

// --- Main Cron Job Handler ---
export default async function handler(req, res) {
  // Secure the endpoint so it can only be triggered by Vercel's cron service
  if (req.headers['x-vercel-cron-secret'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Exit if Firebase Admin SDK is not configured
  if (!serviceAccount) {
    return res.status(500).json({ error: 'Firebase Admin SDK not configured.' });
  }

  try {
    const now = new Date();
    // Use Indian Standard Time (IST)
    const nowIST = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const currentDay = nowIST.toLocaleDateString('en-US', { weekday: 'long' }); // e.g., "Monday"
    const currentTime = nowIST.getHours() * 60 + nowIST.getMinutes(); // Time in minutes from midnight

    // Your full lab schedule
    const schedule = [
        { time: '9:00-10:00', day: 'Monday', subject: 'EIM(SB)' },
        { time: '10:00-11:00', day: 'Monday', subject: 'DSP(SRC)' },
        { time: '11:00-12:00', day: 'Monday', subject: 'ADC(TM)' },
        { time: '12:00-13:00', day: 'Monday', subject: 'IM(ABC)' },
        { time: '14:00-15:00', day: 'Monday', subject: 'MPMC' },
        { time: '15:00-17:00', day: 'Monday', subject: 'Mini Project' },

        { time: '9:00-10:00', day: 'Tuesday', subject: 'DSP(SRC)' },
        { time: '10:00-11:00', day: 'Tuesday', subject: 'EIM(SB)' },
        { time: '11:00-12:00', day: 'Tuesday', subject: 'IM(ABC)' },
        { time: '12:00-13:00', day: 'Tuesday', subject: 'MPMC' },
        { time: '14:00-16:00', day: 'Tuesday', subject: 'DSP LAB' },

        { time: '9:00-10:00', day: 'Wednesday', subject: 'EIM(SB)' },
        { time: '10:00-11:00', day: 'Wednesday', subject: 'IM(BI)' },
        { time: '11:00-13:00', day: 'Wednesday', subject: 'MPMC LAB' },
        { time: '14:00-15:00', day: 'Wednesday', subject: 'DSP(SRC)' },
        { time: '15:00-16:00', day: 'Wednesday', subject: 'ADC(TM)' },
        
        { time: '9:00-10:00', day: 'Thursday', subject: 'ADC(TM)' },
        { time: '10:00-11:00', day: 'Thursday', subject: 'MPMC' },
        { time: '11:00-12:00', day: 'Thursday', subject: 'DSP' },

        { time: '9:00-10:00', day: 'Friday', subject: 'MPMC' },
        { time: '10:00-11:00', day: 'Friday', subject: 'ADC(TM)' },
        { time: '11:00-13:00', day: 'Friday', subject: 'EIM LAB' },
        { time: '14:00-15:00', day: 'Friday', subject: 'EIM(SB)' },
    ];

    const usersSnapshot = await db.collection('userData').get();
    if (usersSnapshot.empty) {
      console.log('No users found.');
      return res.status(200).json({ message: 'No users to process.' });
    }

    const notificationsToSend = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const settings = userData.notificationSettings;

      if (!settings || !settings.labNotify || !settings.email) {
        continue; // Skip user if notifications are disabled or no email
      }

      const minutesBefore = parseInt(settings.notifyMinutesBefore, 10) || 15;

      for (const event of schedule) {
        if (event.subject.toLowerCase().includes('lab') && event.day === currentDay) {
          const [startHour, startMinute] = event.time.split('-')[0].split(':').map(Number);
          const eventStartTime = startHour * 60 + (startMinute || 0);
          
          if (currentTime >= (eventStartTime - minutesBefore) && currentTime < eventStartTime) {
            const notificationKey = `${userDoc.id}-${event.day}-${event.time}`;
            const lastNotified = userData.lastNotified || {};
            const todayKey = nowIST.toISOString().split('T')[0];

            if (lastNotified[notificationKey] !== todayKey) {
              const message = `Reminder: Your "${event.subject}" class is starting in about ${minutesBefore} minutes.`;
              
              // We will call our new API route to send the notification
              notificationsToSend.push(
                fetch(`${process.env.VERCEL_URL}/api/send-notification`, {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    // Add a secret to secure this endpoint as well
                    'x-internal-secret': process.env.INTERNAL_SECRET 
                  },
                  body: JSON.stringify({
                    email: settings.email,
                    subject: `Upcoming Class: ${event.subject}`,
                    message: message,
                  })
                })
              );

              await db.collection('userData').doc(userDoc.id).set({
                lastNotified: { ...lastNotified, [notificationKey]: todayKey }
              }, { merge: true });
            }
          }
        }
      }
    }

    await Promise.all(notificationsToSend);
    res.status(200).json({ message: `Processed notifications. Attempted to send: ${notificationsToSend.length}` });

  } catch (error) {
    console.error('Cron job error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
