// File: /api/send-feedback.js
// This function handles sending feedback emails via Brevo.

export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  
    const { fromEmail, subject, message } = req.body;
    const brevoApiKey = process.env.BREVO_API_KEY;
    const myEmail = 'kumarraj0932@gmail.com'; // Your email address where you'll receive feedback
  
    // --- Improved Debugging ---
    // This check is now more specific.
    if (!brevoApiKey) {
      console.error("SERVER ERROR: BREVO_API_KEY is missing from the environment. Ensure .env.development.local is present and the server was restarted.");
      // Send a very specific error message back to the frontend.
      return res.status(500).json({ error: 'Server configuration error: The Brevo API Key is missing. Please check your local setup and restart the server.' });
    }
  
    if (!fromEmail || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields from the form.' });
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
            email: 'kumarraj0932@gmail.com', 
            name: 'Sagar Dashboard Feedback'
          },
          to: [{ email: myEmail }],
          replyTo: { email: fromEmail },
          subject: `Feedback: ${subject}`,
          htmlContent: `
            <html>
              <body style="font-family: sans-serif; color: #333;">
                <h2 style="color: #4A5568;">New Feedback Received</h2>
                <p><strong>From:</strong> ${fromEmail}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr style="border: none; border-top: 1px solid #E2E8F0;" />
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap; background-color: #F7FAFC; padding: 15px; border-radius: 5px;">${message}</p>
              </body>
            </html>
          `
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Brevo API Error:', errorData);
        throw new Error(errorData.message || 'An error occurred while sending the email.');
      }
  
      const data = await response.json();
      return res.status(200).json({ success: true, messageId: data.messageId });
  
    } catch (error) {
      console.error('Failed to send feedback email:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }
  