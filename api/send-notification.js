const nodemailer = require('nodemailer');

// This function handles the actual sending of an email.
// It uses the Nodemailer library and is configured to use Gmail.
// For this to work, you must set up an "App Password" for your Gmail account.
module.exports = async (req, res) => {
    // Only allow POST requests to this endpoint.
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { to, subject, text } = req.body;

    // Basic validation to ensure required fields are present.
    if (!to || !subject || !text) {
        return res.status(400).json({ error: 'Missing required fields: to, subject, text' });
    }

    // Create a transporter object using Gmail's SMTP server.
    // You MUST set the EMAIL_USER and EMAIL_PASS environment variables for this to work.
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Your Gmail address
            pass: process.env.EMAIL_PASS, // Your Gmail App Password
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        html: `<p>${text.replace(/\n/g, '<br>')}</p>`, // Convert newlines to breaks for HTML email
    };

    try {
        // Attempt to send the email.
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
};