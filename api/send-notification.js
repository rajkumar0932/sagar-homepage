// File: /api/send-notification.js
// This script now uses the Brevo API for sending all transactional emails,
// ensuring reliability for your contest, assignment, and lab reminders.

export default async function handler(req, res) {
    // We only accept POST requests for this endpoint.
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { to, subject, text } = req.body;
    const brevoApiKey = process.env.BREVO_API_KEY;

    // The sender email should be a verified sender in your Brevo account.
    // Using an environment variable makes it easy to manage.
    const senderEmail = process.env.EMAIL_USER;

    // Crucial check: Ensure the server has the necessary configuration.
    if (!brevoApiKey || !senderEmail) {
        console.error("SERVER ERROR: BREVO_API_KEY or EMAIL_USER is not configured in Vercel environment variables.");
        return res.status(500).json({ error: 'Server configuration error. Please check environment variables.' });
    }

    // Ensure the request from cron.js contains all necessary fields.
    if (!to || !subject || !text) {
        return res.status(400).json({ error: 'Bad Request: Missing required fields (to, subject, or text).' });
    }

    try {
        // This is the standard API call to the Brevo transactional email endpoint.
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': brevoApiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { email: senderEmail },
                to: [{ email: to }],
                subject: subject,
                // Using htmlContent allows for better formatting, like line breaks.
                htmlContent: `<html><body><p>${text.replace(/\n/g, '<br>')}</p></body></html>`
            })
        });

        // If Brevo returns an error, we capture and log the details.
        if (!response.ok) {
            const errorBody = await response.json();
            console.error('Brevo API Error:', errorBody);
            throw new Error(`Failed to send email. Brevo API responded with status: ${response.status}`);
        }

        res.status(200).json({ message: 'Email sent successfully via Brevo.' });

    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ error: 'Failed to send email.', details: error.message });
    }
}