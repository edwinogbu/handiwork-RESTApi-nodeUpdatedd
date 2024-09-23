const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const sendEmailWithOTP = async (email, subject, userName, resetLink) => {
    try {
        const htmlBody = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .email-container {
                        max-width: 600px;
                        margin: auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        text-align: center;
                        padding: 10px;
                        background-color: #007BFF;
                        color: #ffffff;
                        border-top-left-radius: 8px;
                        border-top-right-radius: 8px;
                    }
                    .content {
                        padding: 20px;
                    }
                    .footer {
                        text-align: center;
                        padding: 10px;
                        background-color: #f4f4f4;
                        color: #555555;
                        border-bottom-left-radius: 8px;
                        border-bottom-right-radius: 8px;
                    }
                    .button {
                        display: inline-block;
                        padding: 10px 20px;
                        margin: 20px 0;
                        font-size: 16px;
                        color: #ffffff;
                        background-color: #007BFF;
                        text-decoration: underline;
                        // border-radius: 5px;
                    }
                    .logo {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .logo img {
                        max-width: 100%;
                        height: auto;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <h2>${subject}</h2>
                    </div>
                    <div class="content">
                        <div class="logo">
                            <img src="https://page-handiwork.vercel.app/assets/hw%20logo%20b-CD57QKmW.png" alt="Company Logo">
                            
                        </div>
                        <p>Hello ${userName},</p>
                        <p>Click the link below to reset your password:</p>
                        <a href="${resetLink}" class="button">Click the Link To Reset Your Password </a>
                        <p>If you did not request a password reset, please ignore this email.</p>
                        <p>Thank you,<br>The Handiwork Team</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 Handiwork. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: subject,
            html: htmlBody,
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Error sending email');
    }
};

module.exports = sendEmailWithOTP;


// const nodemailer = require('nodemailer');
// const dotenv = require('dotenv');

// dotenv.config();

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD,
//     },
// });

// const sendEmailWithOTP = async (email, subject, userName, resetLink) => {
//     try {
//         const htmlBody = `
//             <!DOCTYPE html>
//             <html>
//             <head>
//                 <style>
//                     body {
//                         font-family: Arial, sans-serif;
//                         background-color: #f4f4f4;
//                         margin: 0;
//                         padding: 0;
//                     }
//                     .email-container {
//                         max-width: 600px;
//                         margin: auto;
//                         background-color: #ffffff;
//                         padding: 20px;
//                         border-radius: 8px;
//                         box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//                     }
//                     .header {
//                         text-align: center;
//                         padding: 10px;
//                         background-color: #007BFF;
//                         color: #ffffff;
//                         border-top-left-radius: 8px;
//                         border-top-right-radius: 8px;
//                     }
//                     .content {
//                         padding: 20px;
//                     }
//                     .footer {
//                         text-align: center;
//                         padding: 10px;
//                         background-color: #f4f4f4;
//                         color: #555555;
//                         border-bottom-left-radius: 8px;
//                         border-bottom-right-radius: 8px;
//                     }
//                     .button {
//                         // display: inline-block;
//                         // padding: 10px 20px;
//                         margin: 20px 0;
//                         font-size: 16px;
//                         color: #ffffff;
//                         background-color: #007BFF;
//                         text-decoration: underline;
//                         // border-radius: 5px;
//                     }
//                 </style>
//             </head>
//             <body>
//                 <div class="email-container">
//                     <div class="header">
//                         <h2>${subject}</h2>
//                     </div>
//                     <div class="content">
//                         <p>Hello ${userName},</p>
//                         <p>Click the link below to reset your password:</p>
//                         <a href="${resetLink}" class="button">Reset Password</a>
//                         <p>If you did not request a password reset, please ignore this email.</p>
//                         <p>Thank you,<br>The Handiwork Team</p>
//                     </div>
//                     <div class="footer">
//                         <p>&copy; 2024 Handiwork. All rights reserved.</p>
//                     </div>
//                 </div>
//             </body>
//             </html>
//         `;

//         const mailOptions = {
//             from: process.env.EMAIL_USERNAME,
//             to: email,
//             subject: subject,
//             html: htmlBody,
//         };

//         await transporter.sendMail(mailOptions);
//         console.log('Email sent successfully');
//     } catch (error) {
//         console.error('Error sending email:', error);
//         throw new Error('Error sending email');
//     }
// };

// module.exports = sendEmailWithOTP;




// const nodemailer = require('nodemailer');
// const dotenv = require('dotenv');

// dotenv.config();

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD,
//     },
// });

// const sendEmailWithOTP = async (email, subject, message) => {
//     try {
//         const htmlBody = `
//             <!DOCTYPE html>
//             <html>
//             <head>
//                 <style>
//                     body {
//                         font-family: Arial, sans-serif;
//                         background-color: #f4f4f4;
//                         margin: 0;
//                         padding: 0;
//                     }
//                     .email-container {
//                         max-width: 600px;
//                         margin: auto;
//                         background-color: #ffffff;
//                         padding: 20px;
//                         border-radius: 8px;
//                         box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//                     }
//                     .header {
//                         text-align: center;
//                         padding: 10px;
//                         background-color: #007BFF;
//                         color: #ffffff;
//                         border-top-left-radius: 8px;
//                         border-top-right-radius: 8px;
//                     }
//                     .content {
//                         padding: 20px;
//                     }
//                     .footer {
//                         text-align: center;
//                         padding: 10px;
//                         background-color: #f4f4f4;
//                         color: #555555;
//                         border-bottom-left-radius: 8px;
//                         border-bottom-right-radius: 8px;
//                     }
//                     .button {
//                         display: inline-block;
//                         padding: 10px 20px;
//                         margin: 20px 0;
//                         font-size: 16px;
//                         color: #ffffff;
//                         background-color: #007BFF;
//                         text-decoration: none;
//                         border-radius: 5px;
//                     }
//                 </style>
//             </head>
//             <body>
//                 <div class="email-container">
//                     <div class="header">
//                         <h2>${subject}</h2>
//                     </div>
//                     <div class="content">
//                         <p>Hello,</p>
//                         <p>${message}</p>
//                         <a href="${message}" class="button">Reset Password</a>
//                         <p>If you did not request a password reset, please ignore this email.</p>
//                         <p>Thank you,<br>The Handiwork Team</p>
//                     </div>
//                     <div class="footer">
//                         <p>&copy; 2024 Handiwork. All rights reserved.</p>
//                     </div>
//                 </div>
//             </body>
//             </html>
//         `;

//         const mailOptions = {
//             from: process.env.EMAIL_USERNAME,
//             to: email,
//             subject: subject,
//             html: htmlBody,
//         };

//         await transporter.sendMail(mailOptions);
//         console.log('Email sent successfully');
//     } catch (error) {
//         console.error('Error sending email:', error);
//         throw new Error('Error sending email');
//     }
// };

// module.exports = sendEmailWithOTP;


// const nodemailer = require('nodemailer');
// const dotenv = require('dotenv');

// dotenv.config();

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD,
//     },
// });

// const sendEmailWithOTP = async (email, subject, resetLink) => {
//     try {
//         const htmlBody = `
//             <!DOCTYPE html>
//             <html>
//             <head>
//                 <style>
//                     body {
//                         font-family: Arial, sans-serif;
//                         background-color: #f4f4f4;
//                         margin: 0;
//                         padding: 0;
//                     }
//                     .email-container {
//                         max-width: 600px;
//                         margin: auto;
//                         background-color: #ffffff;
//                         padding: 20px;
//                         border-radius: 8px;
//                         box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//                     }
//                     .header {
//                         text-align: center;
//                         padding: 10px;
//                         background-color: #007BFF;
//                         color: #ffffff;
//                         border-top-left-radius: 8px;
//                         border-top-right-radius: 8px;
//                     }
//                     .content {
//                         padding: 20px;
//                     }
//                     .footer {
//                         text-align: center;
//                         padding: 10px;
//                         background-color: #f4f4f4;
//                         color: #555555;
//                         border-bottom-left-radius: 8px;
//                         border-bottom-right-radius: 8px;
//                     }
//                     .button {
//                         display: inline-block;
//                         padding: 10px 20px;
//                         margin: 20px 0;
//                         font-size: 16px;
//                         color: #ffffff;
//                         background-color: #007BFF;
//                         text-decoration: none;
//                         border-radius: 5px;
//                     }
//                 </style>
//             </head>
//             <body>
//                 <div class="email-container">
//                     <div class="header">
//                         <h2>Password Reset</h2>
//                     </div>
//                     <div class="content">
//                         <p>Hello,</p>
//                         <p>You requested a password reset for your account. Please click the button below to reset your password:</p>
//                         <a href="${resetLink}" class="button">Reset Password</a>
//                         <p>If you did not request a password reset, please ignore this email.</p>
//                         <p>Thank you,<br>The Handiwork Team</p>
//                     </div>
//                     <div class="footer">
//                         <p>&copy; 2024 Handiwork. All rights reserved.</p>
//                     </div>
//                 </div>
//             </body>
//             </html>
//         `;

//         const mailOptions = {
//             from: process.env.EMAIL_USERNAME,
//             to: email,
//             subject: subject,
//             html: htmlBody,
//         };

//         await transporter.sendMail(mailOptions);
//         console.log('Email sent successfully');
//     } catch (error) {
//         console.error('Error sending email:', error);
//         throw new Error('Error sending email');
//     }
// };

// module.exports = sendEmailWithOTP;


// const nodemailer = require('nodemailer');
// const dotenv = require('dotenv');

// dotenv.config();

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD,
//     },
// });

// const sendEmailWithOTP = async (email, subject, body) => {
//     try {
//         const mailOptions = {
//             from: process.env.EMAIL_USERNAME,
//             to: email,
//             subject: subject,
//             text: body,
//             html: `<p>${body}</p>`,
//         };

//         await transporter.sendMail(mailOptions);
//         console.log('Email sent successfully');
//     } catch (error) {
//         console.error('Error sending email:', error);
//         throw new Error('Error sending email');
//     }
// };

// module.exports = sendEmailWithOTP;
