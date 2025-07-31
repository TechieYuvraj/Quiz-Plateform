import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendOtpEmail = async (toEmail, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: 'CG Quiz Register OTP',
        html: `<h3>Your register OTP is: <b>${otp}</b></h3><p>It is valid for 5 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);
};


export const sendOtpEmail_login = async (toEmail, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: 'CG Quiz Login OTP',
        html: `<h3>Your login OTP is: <b>${otp}</b></h3><p>It is valid for 5 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);
};
