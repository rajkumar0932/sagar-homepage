// File: /api/send-feedback.js
// This function handles sending feedback emails via Brevo.

export default async function handler(req, res) {
    // Ensure this is a POST request
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  
    // Destructure the expected fields from the request body
    const { fromEmail, subject, message } = req.body;
    const brevoApiKey = process.env.BREVO_API_KEY;
    const recipientEmail = 'kumarraj0932@gmail.com'; // Your email address
  
    // Validate that all required information is present
    if (!fromEmail || !subject || !message || !brevoApiKey) {
      return res.status(400).json({ error: 'Missing required fields or API key.' });
    }
  
    try {
      // Make the API call to Brevo
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            email: fromEmail,
            name: 'Feedback Form' // This name will appear as the sender
          },
          to: [{ email: recipientEmail }], // This is where the feedback will be sent
          subject: `Feedback: ${subject}`,
          htmlContent: `
            <html>
              <body>
                <h1>New Feedback Received</h1>
                <p><strong>From:</strong> ${fromEmail}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr />
                <p>${message.replace(/\n/g, "<br>")}</p>
              </body>
            </html>
          `
        })
      });
  
      // Handle non-successful responses from the Brevo API
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Brevo API Error: ${errorData.message || 'Failed to send email'}`);
      }
  
      const data = await response.json();
      return res.status(200).json({ success: true, messageId: data.messageId });
  
    } catch (error) {
      console.error('Failed to send feedback email:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }