
const admin = require('firebase-admin');
const fetch = require('node-fetch');

// --- Firebase Admin SDK Initialization ---
// This part is crucial for accessing Firestore from the backend.
// It uses a service account key that you must store as an environment variable.
try {
    if (!admin.apps.length) {
        const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
        if (!serviceAccountBase64) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 env variable is not set.');
        }
        const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'));
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }
} catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
}
const db = admin.firestore();

// --- Contest Generation Logic (Mirrors Frontend) ---
// This logic is replicated from the frontend to ensure the backend knows about the same contests.
const generateLeetCodeWeekly = (count = 4) => {
    const contests = []; let weeklyContestNum = 462; const now = new Date();
    let nextSunday = new Date(now); nextSunday.setUTCDate(now.getUTCDate() + (7 - now.getUTCDay()) % 7); nextSunday.setUTCHours(2, 30, 0, 0);
    if (nextSunday <= now) { nextSunday.setUTCDate(nextSunday.getUTCDate() + 7); }
    for (let i = 0; i < count; i++) {
        const contestDate = new Date(nextSunday.getTime() + i * 7 * 24 * 60 * 60 * 1000);
        contests.push({ id: `lc-weekly-${weeklyContestNum + i}`, name: `LeetCode Weekly Contest ${weeklyContestNum + i}`, url: 'https://leetcode.com/contest/', start_time: contestDate.toISOString(), duration: 5400, site: 'LeetCode' });
    } return contests;
};
const generateLeetCodeBiweekly = (count = 3) => {
    const contests = []; let biweeklyContestNum = 135; const now = new Date();
    const knownDate = new Date('2024-07-20T14:30:00Z'); let nextContestDate = new Date(knownDate);
    while (nextContestDate <= now) { nextContestDate.setUTCDate(nextContestDate.getUTCDate() + 14); biweeklyContestNum++; }
    for (let i = 0; i < count; i++) {
        const contestDate = new Date(nextContestDate.getTime() + i * 14 * 24 * 60 * 60 * 1000);
        contests.push({ id: `lc-biweekly-${biweeklyContestNum + i}`, name: `LeetCode Biweekly Contest ${biweeklyContestNum + i}`, url: 'https://leetcode.com/contest/', start_time: contestDate.toISOString(), duration: 5400, site: 'LeetCode' });
    } return contests;
};
const generateCodeChefStarters = (count = 4) => {
    const contests = []; let startersNum = 199; const now = new Date();
    let nextWednesday = new Date(now); nextWednesday.setUTCDate(now.getUTCDate() + (3 - now.getUTCDay() + 7) % 7); nextWednesday.setUTCHours(14, 30, 0, 0);
    if (nextWednesday <= now) { nextWednesday.setUTCDate(nextWednesday.getUTCDate() + 7); }
    for (let i = 0; i < count; i++) {
        const contestDate = new Date(nextWednesday.getTime() + i * 7 * 24 * 60 * 60 * 1000);
        contests.push({ id: `cc-starters-${startersNum + i}`, name: `CodeChef Starters ${startersNum + i}`, url: 'https://www.codechef.com/contests', start_time: contestDate.toISOString(), duration: 7200, site: 'CodeChef' });
    } return contests;
};

// --- Main Cron Job Handler ---
module.exports = async (req, res) => {
    try {
        await sendNotification('kumarraj0932@gmail.com', 'CRON JOB TEST', 'This is a test notification to confirm the cron job is running.');
        const now = new Date();
        const usersSnapshot = await db.collection('userData').get();
        
        // --- Generate Contest List ---
        const leetCodeContests = [...generateLeetCodeWeekly(), ...generateLeetCodeBiweekly()];
        const codeChefContests = generateCodeChefStarters();
        // Note: Fetching Codeforces is omitted here to simplify, can be added back if needed.
        const allContests = [...leetCodeContests, ...codeChefContests];

        for (const userDoc of usersSnapshot.docs) {
            const user = userDoc.data();
            const userId = userDoc.id;
            const userEmail = user.notificationSettings?.email;

            if (!userEmail) continue; // Skip user if they haven't set an email.

            // 1. Check for Assignment Reminders
            if (user.assignments && user.notificationSettings.contestNotify !== false) {
                for (const assignment of user.assignments) {
                    if (assignment.notificationSent) continue;
                    const deadline = new Date(assignment.deadline);
                    const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
                    if (diffHours > 0 && diffHours <= 24) {
                        const subject = `Assignment Due Soon: ${assignment.title}`;
                        const text = `Hi ${user.firstName || 'User'},\n\nThis is a reminder that your assignment "${assignment.title}" is due in less than 24 hours.\n\nGood luck!`;
                        await sendNotification(userEmail, subject, text);
                        // Mark as sent to prevent duplicate notifications
                        const updatedAssignments = user.assignments.map(a => a.id === assignment.id ? { ...a, notificationSent: true } : a);
                        await db.collection('userData').doc(userId).update({ assignments: updatedAssignments });
                    }
                }
            }

            // 2. Check for Contest Reminders
            if (user.notificationSettings.contestNotify !== false) {
                 for (const contest of allContests) {
                    const startTime = new Date(contest.start_time);
                    const diffMinutes = (startTime.getTime() - now.getTime()) / (1000 * 60);
                    // Check if contest is within the next hour and notification hasn't been sent
                    if (diffMinutes > 0 && diffMinutes <= 60 && !(user.sentNotifications || []).includes(contest.id)) {
                        const subject = `Contest Starting Soon: ${contest.name}`;
                        const text = `Hi ${user.firstName || 'User'},\n\nThe contest "${contest.name}" is starting in about an hour.\n\nGet ready! Here is the link: ${contest.url}`;
                        await sendNotification(userEmail, subject, text);
                        // Record that the notification was sent
                        await db.collection('userData').doc(userId).update({
                            sentNotifications: admin.firestore.FieldValue.arrayUnion(contest.id)
                        });
                    }
                }
            }
           
            // 3. Check for Lab Period Reminders
           // --- Start of the updated section ---

            // 3. Check for Lab Period Reminders
            if (user.schedule && user.notificationSettings.labNotify !== false) {
                const today = now.toLocaleString('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' }).toLowerCase();
                const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes from midnight (UTC)
                
                for (const period of user.schedule) {
                    const subject = period[today];
                    if (subject && subject.toUpperCase().includes('LAB')) {
                        // Create a unique ID for this lab on this specific day to track if a notification has been sent.
                        const labId = `lab-${subject.replace(/\s+/g, '-')}-${now.toISOString().split('T')[0]}`;

                        // Check if we've already sent a notification for this specific lab today.
                        if ((user.sentNotifications || []).includes(labId)) {
                            continue; // Skip if notification already sent.
                        }

                        const [startHour] = period.time.split(':')[0].split('-').map(Number);
                        // This logic correctly calculates the start time in UTC minutes
                        const periodStartTime = (startHour + (startHour < 6 ? 12 : 0) - 5.5) * 60; 
                        const diffMinutes = periodStartTime - currentTime;

                         if (diffMinutes > 0 && diffMinutes <= 15) {
                            const notificationSubject = `Lab Class Starting Soon: ${subject}`;
                            const text = `Hi ${user.firstName || 'User'},\n\nYour lab class "${subject}" is starting in about 15 minutes.`;
                            
                            await sendNotification(userEmail, notificationSubject, text);

                            // IMPORTANT: Record that the notification for this lab was sent.
                            await db.collection('userData').doc(userId).update({
                                sentNotifications: admin.firestore.FieldValue.arrayUnion(labId)
                            });
                        }
                    }
                }
            }

// --- End of the updated section ---
        }
        res.status(200).json({ message: 'Cron job completed successfully.' });
    } catch (error) {
        console.error('Error in cron job:', error);
        res.status(500).json({ error: 'Cron job failed', details: error.message });
    }
};

// Helper function to call our own send-notification API
async function sendNotification(to, subject, text) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    try {
        await fetch(`${apiUrl}/api/send-notification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to, subject, text }),
        });
    } catch (error) {
        console.error(`Failed to send notification to ${to}:`, error);
    }
}
