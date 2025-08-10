// File: /api/lib/email.js
// This is our new centralized library for sending emails with Brevo.

export async function sendEmail({ to, subject, text }) {
    const brevoApiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.EMAIL_USER;

    if (!brevoApiKey || !senderEmail) {
        console.error("SERVER ERROR: BREVO_API_KEY or EMAIL_USER is not configured.");
        // Throw an error to ensure the calling function knows about the failure.
        throw new Error('Server configuration error for email.');
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

        // Return true on success
        return true;

    } catch (error) {
        console.error('Error in sendEmail function:', error);
        // Re-throw the error so the original caller can handle it.
        throw error;
    }
}