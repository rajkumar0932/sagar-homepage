// File: /api/send-notification.js
// This is the correct version that uses the Brevo API for reliability.

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { to, subject, text } = req.body;
    const brevoApiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.EMAIL_USER;

    if (!brevoApiKey || !senderEmail) {
        console.error("SERVER ERROR: BREVO_API_KEY or EMAIL_USER is not configured.");
        return res.status(500).json({ error: 'Server configuration error.' });
    }

    if (!to || !subject || !text) {
        return res.status(400).json({ error: 'Bad Request: Missing required fields.' });
    }

    try {
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
                htmlContent: `<html><body><p>${text.replace(/\n/g, '<br>')}</p></body></html>`
            })
        });

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