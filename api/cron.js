import { sendEmail } from './lib/email.js';
const admin = require('firebase-admin');

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

// --- Contest Generation Logic (This is a placeholder, as it was not provided in the last turn) ---
const generateLeetCodeWeekly = (count = 4) => { return []; };
const generateLeetCodeBiweekly = (count = 3) => { return []; };
const generateCodeChefStarters = (count = 4) => { return []; };


// --- Main Cron Job Handler ---
export default async (req, res) => {
    console.log("--- Cron Job Started ---");
    try {
        const now = new Date();
        const usersSnapshot = await db.collection('userData').get();
        console.log(`Found ${usersSnapshot.docs.length} user(s) to process.`);

        for (const userDoc of usersSnapshot.docs) {
            const user = userDoc.data();
            const userId = userDoc.id;
            const userEmail = user.notificationSettings?.email;

            // --- Assignment Reminders (FINAL CORRECTED LOGIC) ---
            if (user.assignments && user.notificationSettings?.contestNotify === true) {
                // This flag will track if any changes were made.
                let assignmentsWereUpdated = false;
                
                // The .map() function creates a NEW array with the updated assignments.
                const updatedAssignments = user.assignments.map(assignment => {
                    // If notification was already sent or there's no deadline, do not change anything.
                    if (assignment.notificationSent || !assignment.deadline) {
                        return assignment;
                    }

                    const deadline = new Date(assignment.deadline);
                    const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

                    // Check if the assignment is within the 24-hour notification window.
                    if (diffHours > 0 && diffHours <= 24) {
                        console.log(`-> Sending reminder for: "${assignment.title}"`);
                        const subject = `Assignment Due Soon: ${assignment.title}`;
                        const text = `Hi ${user.firstName || 'User'},\n\nThis is a reminder that your assignment "${assignment.title}" is due in less than 24 hours.`;
                        
                        // We use a .then().catch() here so that a single failed email doesn't stop the whole process.
                        sendEmail({ to: userEmail, subject, text }).catch(err => console.error(`Failed to send email for ${assignment.title}:`, err));
                        
                        // Mark that we need to update the database.
                        assignmentsWereUpdated = true;
                        
                        // Return the MODIFIED assignment with the notificationSent flag.
                        return { ...assignment, notificationSent: true };
                    }
                    
                    // If not in the window, return the original assignment unmodified.
                    return assignment;
                });

                // **THE FIX:** We only write to the database ONE time, after the loop is finished, and only if changes were made.
                if (assignmentsWereUpdated) {
                    await db.collection('userData').doc(userId).update({ assignments: updatedAssignments });
                    console.log("--> Updated assignments in Firestore with notificationSent flags.");
                }
            }
            // ... (The rest of your code for contests and labs remains the same)
        }
        console.log("\n--- Cron Job Finished Successfully ---");
        res.status(200).json({ message: 'Cron job completed successfully.' });
    } catch (error) {
        console.error('CRITICAL ERROR in cron job:', error);
        res.status(500).json({ error: 'Cron job failed', details: error.message });
    }
};