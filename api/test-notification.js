// File: /api/test-notification.js
// A simple endpoint to test if email sending is configured correctly.

export default async function handler(req, res) {
    // Security check: Only allow this to run in a development environment.
    if (process.env.NODE_ENV !== 'development') {
      return res.status(404).json({ error: 'Not found' });
    }
  
    console.log('--- Received request to /api/test-notification ---');
  
    const brevoApiKey = process.env.BREVO_API_KEY;
  
    if (!brevoApiKey) {
      console.error('BREVO_API_KEY is not set in environment variables.');
      return res.status(500).json({ error: 'Server configuration error: Missing Brevo API Key.' });
    }
  
    console.log('Brevo API Key found. Preparing to send email...');
  
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
            name: 'Sagar\'s Dashboard Test'
          },
          to: [{ email: 'kumarraj0932@gmail.com' }], // Sending to yourself for the test
          subject: 'Test Email from Vercel Dev Server',
          htmlContent: `
            <html>
              <body>
                <h1>Hello!</h1>
                <p>If you are seeing this email, your Brevo API configuration is working correctly on your local server.</p>
              </body>
            </html>
          `
        })
      });
  
      console.log('Brevo API response status:', response.status);
      const responseData = await response.json();
      console.log('Brevo API response data:', responseData);
  
      if (!response.ok) {
        throw new Error(`Brevo API Error: ${responseData.message || 'Unknown error'}`);
      }
  
      console.log('--- Test email sent successfully! ---');
      return res.status(200).json({ success: true, message: 'Test email sent successfully! Please check your inbox.' });
  
    } catch (error) {
      console.error('--- FAILED to send test email ---');
      console.error(error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }
  