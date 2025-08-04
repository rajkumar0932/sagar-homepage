// File: /api/cron.js
// This function runs every 15 minutes to check for upcoming assignments and labs.

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';



// --- Firebase Admin SDK Setup ---
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
} catch (e) {
  console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY.');
  serviceAccount = null;
}

if (serviceAccount && !getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

// --- Main Cron Job Handler ---
export default async function handler(req, res) {
  if (req.headers['x-vercel-cron-secret'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (!serviceAccount) {
    return res.status(500).json({ error: 'Firebase Admin SDK not configured.' });
  }

  try {
    const now = new Date();
    const nowIST = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    
    const usersSnapshot = await db.collection('userData').get();
    if (usersSnapshot.empty) {
      return res.status(200).json({ message: 'No users to process.' });
    }

    const notificationsToSend = [];
    const userUpdates = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const settings = userData.notificationSettings;

      if (!settings || !settings.email) {
        continue; // Skip user if no email is set
      }

      // --- 1. Check for Assignment Notifications (12-hour window) ---
      const assignments = userData.assignments || [];
      let userAssignmentsModified = false;
      const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60 * 1000);

      const updatedAssignments = assignments.map(assignment => {
        const deadline = new Date(assignment.deadline);
        if (deadline > now && deadline <= twelveHoursFromNow && !assignment.notificationSent) {
          const message = `Reminder: Your assignment "${assignment.title}" for subject "${assignment.subject || 'General'}" is due in less than 12 hours.`;
          notificationsToSend.push(
            fetch(`${process.env.VERCEL_URL}/api/send-notification`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.INTERNAL_SECRET },
              body: JSON.stringify({ email: settings.email, subject: `Assignment Due Soon: ${assignment.title}`, message })
            })
          );
          userAssignmentsModified = true;
          return { ...assignment, notificationSent: true };
        }
        return assignment;
      });

      if (userAssignmentsModified) {
        userUpdates.push(db.collection('userData').doc(userDoc.id).update({ assignments: updatedAssignments }));
      }

      // --- 2. Check for Lab Period Notifications ---
      if (settings.labNotify) {
        const schedule = [
            { time: '14:00-16:00', day: 'Tuesday', subject: 'DSP LAB' },
            { time: '11:00-13:00', day: 'Wednesday', subject: 'MPMC LAB' },
            { time: '11:00-13:00', day: 'Friday', subject: 'EIM LAB' },
        ];
        
        const currentDay = nowIST.toLocaleDateString('en-US', { weekday: 'long' });
        const currentTime = nowIST.getHours() * 60 + nowIST.getMinutes();
        const minutesBefore = parseInt(settings.notifyMinutesBefore, 10) || 15;

        for (const event of schedule) {
          if (event.day === currentDay) {
            const [startHour, startMinute] = event.time.split('-')[0].split(':').map(Number);
            const eventStartTime = startHour * 60 + (startMinute || 0);
            
            if (currentTime >= (eventStartTime - minutesBefore) && currentTime < eventStartTime) {
              const notificationKey = `${userDoc.id}-${event.day}-${event.time}`;
              const lastNotified = userData.lastNotified || {};
              const todayKey = nowIST.toISOString().split('T')[0];

              if (lastNotified[notificationKey] !== todayKey) {
                const message = `Reminder: Your "${event.subject}" class is starting in about ${minutesBefore} minutes.`;
                notificationsToSend.push(
                  fetch(`${process.env.VERCEL_URL}/api/send-notification`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.INTERNAL_SECRET },
                    body: JSON.stringify({ email: settings.email, subject: `Upcoming Class: ${event.subject}`, message })
                  })
                );
                userUpdates.push(db.collection('userData').doc(userDoc.id).set({
                  lastNotified: { ...lastNotified, [notificationKey]: todayKey }
                }, { merge: true }));
              }
            }
          }
        }
      }
    }

    await Promise.all([...notificationsToSend, ...userUpdates]);
    
    res.status(200).json({ message: `Processed all tasks. Attempted to send: ${notificationsToSend.length} notifications.` });

  } catch (error) {
    console.error('Cron job error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
