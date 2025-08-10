import { sendEmail } from './lib/email.js';
const admin = require('firebase-admin');

// This new config block tells Vercel when to run this function.
export const config = {
  schedule: '*/15 * * * *',
};

// --- Firebase Admin SDK Initialization ---
try {
    if (!admin.apps.length) {
        const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
        if (!serviceAccountBase64) { throw new Error('Firebase service account key is not set.'); }
        const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'));
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
} catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
}
const db = admin.firestore();

// --- Main Cron Job Handler ---
export default async (req, res) => {
    try {
        const now = new Date();
        const usersSnapshot = await db.collection('userData').get();
        
        for (const userDoc of usersSnapshot.docs) {
            const user = userDoc.data();
            const userId = userDoc.id;
            const userEmail = user.notificationSettings?.email;

            if (!userEmail) continue;

            // --- Assignment Reminders ---
            if (user.assignments && user.notificationSettings?.contestNotify === true) {
                let assignmentsWereUpdated = false;
                const updatedAssignments = user.assignments.map(assignment => {
                    if (assignment.notificationSent || !assignment.deadline) {
                        return assignment;
                    }
                    const deadline = new Date(assignment.deadline);
                    const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

                    if (diffHours > 0 && diffHours <= 24) {
                        const subject = `Assignment Due Soon: ${assignment.title}`;
                        const text = `Hi ${user.firstName || 'User'},\n\nThis is a reminder that your assignment "${assignment.title}" is due in less than 24 hours.`;
                        sendEmail({ to: userEmail, subject, text }).catch(err => console.error(`Failed to send email for ${assignment.title}:`, err));
                        assignmentsWereUpdated = true;
                        return { ...assignment, notificationSent: true };
                    }
                    return assignment;
                });
                if (assignmentsWereUpdated) {
                    await db.collection('userData').doc(userId).update({ assignments: updatedAssignments });
                }
            }
             // ... (The rest of your code for contests and labs remains the same)
        }
        res.status(200).json({ message: 'Cron job ran successfully.' });
    } catch (error) {
        console.error('CRITICAL ERROR in cron job:', error);
        res.status(500).json({ error: 'Cron job failed', details: error.message });
    }
};