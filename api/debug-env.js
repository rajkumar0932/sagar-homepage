// File: /api/debug-env.js
// A simple endpoint for debugging environment variables.

export default async function handler(req, res) {
    // Security check: Only allow this to run in a development environment.
    if (process.env.NODE_ENV !== 'development') {
      return res.status(404).json({ error: 'Not found' });
    }
  
    const brevoApiKey = process.env.BREVO_API_KEY;
  
    if (brevoApiKey) {
      res.status(200).json({
        status: 'SUCCESS',
        message: 'BREVO_API_KEY was found.',
        key_preview: `${brevoApiKey.substring(0, 8)}...` // Show only the first 8 characters for verification
      });
    } else {
      res.status(404).json({
        status: 'ERROR',
        message: 'BREVO_API_KEY was NOT found in the server environment.'
      });
    }
  }
  