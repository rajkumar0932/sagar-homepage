// File: /api/send-notification.js
// This function handles the actual sending of emails via Brevo.

export default async function handler(req, res) {
    // Secure this endpoint so it can only be called by our cron job
    if (req.method !== 'POST' || req.headers['x-internal-secret'] !== process.env.INTERNAL_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    const { email, subject, message } = req.body;
    const brevoApiKey = process.env.BREVO_API_KEY;
  
    if (!email || !subject || !message || !brevoApiKey) {
      return res.status(400).json({ error: 'Missing required fields or API key.' });
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
          sender: {
            // Using your verified sender email address
            email: 'kumarraj0932@gmail.com', 
            name: 'Sagar\'s Dashboard'
          },
          to: [{ email: email }],
          subject: subject,
          htmlContent: `
            <html>
              <body>
                <h1>Reminder</h1>
                <p>${message}</p>
                <p><em>This is an automated notification from your personal dashboard.</em></p>
              </body>
            </html>
          `
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Brevo API Error: ${errorData.message}`);
      }
  
      const data = await response.json();
      return res.status(200).json({ success: true, messageId: data.messageId });
  
    } catch (error) {
      console.error('Failed to send email:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }
  