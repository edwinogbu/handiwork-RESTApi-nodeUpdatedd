// Import Nodemailer module
const nodemailer = require('nodemailer');

// Create a function to send emails
async function EmailSending(subject, message, recipientEmail) {
    try {
        // Create a transporter with your SMTP configuration
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'anointedboy4real80@gmail.com', // Your Gmail address
                pass: 'vxzc nfiu bwba gapo', // Your Gmail password
            },
        });

        // Define email options
        let mailOptions = {
            from: 'anointedboy4real80@gmail.com', // Your Gmail address
            to: recipientEmail, // List of recipients
            subject: subject, // Email subject
            text: message // Email body (in plain text)
        };

        // Send email
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ', info.response);
    } catch (error) {
        console.error('Error sending email: ', error);
    }
}

module.exports = EmailSending;
