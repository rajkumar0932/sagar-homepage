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

// --- Contest Generation Logic (remains unchanged) ---
const generateLeetCodeWeekly = (count = 4) => { /* ... code ... */ };
const generateLeetCodeBiweekly = (count = 3) => { /* ... code ... */ };
const generateCodeChefStarters = (count = 4) => { /* ... code ... */ };


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
            console.log(`\nProcessing user: ${userId}`);
            
            // --- DEBUG: Log the entire notificationSettings object ---
            console.log("1. User's notificationSettings:", user.notificationSettings);

            const userEmail = user.notificationSettings?.email;
            if (!userEmail) {
                console.log("-> Skipping user: No email address found.");
                continue;
            }

            // --- Assignment Reminders ---
            const assignmentNotifySetting = user.notificationSettings?.contestNotify;
            console.log(`2. Checking Assignment notifications. Setting is: ${assignmentNotifySetting}`);

            if (user.assignments && assignmentNotifySetting === true) {
                console.log("-> Condition MET. Checking assignments...");
                for (const assignment of user.assignments) {
                    console.log(`   - Processing assignment: "${assignment.title}"`);
                    if (assignment.notificationSent) {
                        console.log("     -> Skipping: Notification already sent.");
                        continue;
                    }

                    const deadline = new Date(assignment.deadline);
                    const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
                    
                    // --- DEBUG: Log date comparison values ---
                    console.log(`     - Deadline: ${deadline.toISOString()}`);
                    console.log(`     - Current Time: ${now.toISOString()}`);
                    console.log(`     - Hours until deadline: ${diffHours.toFixed(2)}`);

                    if (diffHours > 0 && diffHours <= 24) {
                        console.log("     --> Condition MET. Sending email now!");
                        const subject = `Assignment Due Soon: ${assignment.title}`;
                        const text = `Hi ${user.firstName || 'User'},\n\nThis is a reminder that your assignment "${assignment.title}" is due in less than 24 hours.\n\nGood luck!`;
                        await sendEmail({ to: userEmail, subject, text });
                        console.log("     --> Email sent successfully!");

                        // Update logic remains the same
                        const updatedAssignments = user.assignments.map(a => a.id === assignment.id ? { ...a, notificationSent: true } : a);
                        await db.collection('userData').doc(userId).update({ assignments: updatedAssignments });
                    } else {
                        console.log("     -> Skipping: Not within 24-hour window.");
                    }
                }
            } else {
                console.log("-> Condition FAILED. Skipping assignment check.");
            }
        }
        console.log("\n--- Cron Job Finished Successfully ---");
        res.status(200).json({ message: 'Cron job completed successfully with debugging.' });
    } catch (error) {
        console.error('CRITICAL ERROR in cron job:', error);
        res.status(500).json({ error: 'Cron job failed', details: error.message });
    }
};