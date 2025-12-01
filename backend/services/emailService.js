const nodemailer = require('nodemailer');
const db = require('../config/database');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.hostinger.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });
};

// Send email
const sendEmail = async (to, subject, html) => {
    try {
        const transporter = createTransporter();

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Portal Terintegrasi" <noreply@portal.local>',
            to,
            subject,
            html
        });

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

// Process email queue
const processEmailQueue = async () => {
    try {
        const [emails] = await db.query(
            `SELECT * FROM email_queue 
       WHERE status = 'pending' 
       AND attempts < 3 
       ORDER BY created_at ASC 
       LIMIT 10`
        );

        for (const email of emails) {
            const result = await sendEmail(
                email.recipient_email,
                email.subject,
                email.body
            );

            if (result.success) {
                await db.query(
                    `UPDATE email_queue 
           SET status = 'sent', sent_at = NOW(), attempts = attempts + 1
           WHERE id = ?`,
                    [email.id]
                );
            } else {
                await db.query(
                    `UPDATE email_queue 
           SET status = 'failed', error_message = ?, attempts = attempts + 1
           WHERE id = ?`,
                    [result.error, email.id]
                );
            }
        }
    } catch (error) {
        console.error('Process email queue error:', error);
    }
};

// Start email processor (every 30 seconds)
const startEmailProcessor = () => {
    setInterval(processEmailQueue, 30000);
    console.log('📧 Email processor started');
};

module.exports = {
    sendEmail,
    processEmailQueue,
    startEmailProcessor
};
