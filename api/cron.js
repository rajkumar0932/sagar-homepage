import { sendEmail } from './lib/email.js';
const admin = require('firebase-admin');

// --- Firebase Admin SDK Initialization ---
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

// --- Contest Generation Logic ---
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
export default async (req, res) => {
    try {
        // THIS IS THE TEST EMAIL. We now call sendEmail directly.
     

        const now = new Date();
        const usersSnapshot = await db.collection('userData').get();
        const allContests = [...generateLeetCodeWeekly(), ...generateLeetCodeBiweekly(), ...generateCodeChefStarters()];

        for (const userDoc of usersSnapshot.docs) {
            const user = userDoc.data();
            const userId = userDoc.id;
            const userEmail = user.notificationSettings?.email;

            if (!userEmail) continue; 

            // Assignment Reminders
            if (user.assignments && user.notificationSettings.contestNotify !== false) {
                for (const assignment of user.assignments) {
                    if (assignment.notificationSent) continue;
                    const deadline = new Date(assignment.deadline);
                    const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
                    if (diffHours > 0 && diffHours <= 24) {
                        const subject = `Assignment Due Soon: ${assignment.title}`;
                        const text = `Hi ${user.firstName || 'User'},\n\nThis is a reminder that your assignment "${assignment.title}" is due in less than 24 hours.\n\nGood luck!`;
                        await sendEmail({ to: userEmail, subject, text });
                        const updatedAssignments = user.assignments.map(a => a.id === assignment.id ? { ...a, notificationSent: true } : a);
                        await db.collection('userData').doc(userId).update({ assignments: updatedAssignments });
                    }
                }
            }

            // Contest Reminders
            if (user.notificationSettings.contestNotify !== false) {
                 for (const contest of allContests) {
                    const startTime = new Date(contest.start_time);
                    const diffMinutes = (startTime.getTime() - now.getTime()) / (1000 * 60);
                    if (diffMinutes > 0 && diffMinutes <= 60 && !(user.sentNotifications || []).includes(contest.id)) {
                        const subject = `Contest Starting Soon: ${contest.name}`;
                        const text = `Hi ${user.firstName || 'User'},\n\nThe contest "${contest.name}" is starting in about an hour.\n\nGet ready! Here is the link: ${contest.url}`;
                        await sendEmail({ to: userEmail, subject, text });
                        await db.collection('userData').doc(userId).update({
                            sentNotifications: admin.firestore.FieldValue.arrayUnion(contest.id)
                        });
                    }
                }
            }
           
            // Lab Period Reminders
            if (user.schedule && user.notificationSettings.labNotify !== false) {
                 const today = now.toLocaleString('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' }).toLowerCase();
                 const currentTime = now.getHours() * 60 + now.getMinutes();
                 for (const period of user.schedule) {
                    const labSubject = period[today];
                    if (labSubject && labSubject.toUpperCase().includes('LAB')) {
                        const labId = `lab-${labSubject.replace(/\s+/g, '-')}-${now.toISOString().split('T')[0]}`;
                        if ((user.sentNotifications || []).includes(labId)) continue;
                        
                        const [startHour] = period.time.split(':')[0].split('-').map(Number);
                        const periodStartTime = (startHour + (startHour < 6 ? 12 : 0) - 5.5) * 60;
                        const diffMinutes = periodStartTime - currentTime;
                        if (diffMinutes > 0 && diffMinutes <= 15) {
                            const subject = `Lab Class Starting Soon: ${labSubject}`;
                            const text = `Hi ${user.firstName || 'User'},\n\nYour lab class "${labSubject}" is starting in about 15 minutes.`;
                            await sendEmail({ to: userEmail, subject, text });
                            await db.collection('userData').doc(userId).update({
                                sentNotifications: admin.firestore.FieldValue.arrayUnion(labId)
                            });
                        }
                    }
                }
            }
        }
        res.status(200).json({ message: 'Cron job completed successfully.' });
    } catch (error) {
        console.error('Error in cron job:', error);
        res.status(500).json({ error: 'Cron job failed', details: error.message });
    }
};