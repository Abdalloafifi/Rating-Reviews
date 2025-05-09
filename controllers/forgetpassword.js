const User = require('../models/auth');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');
const passwordComplexity = require("joi-password-complexity");
const xss = require('xss');
const Joi = require('joi');
const nodemailer = require('nodemailer');






exports.sendResetPasswordEmail = asyncHandler(async (req, res) => {
    const data = {
        email: xss(req.body.email)
    };
    const { error } = validateResetEmail(data);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const user = await User.findOne({ email: data.email });
    if (!user) return res.status(404).json({ error: "User not found" });
    const randamnumber = Math.floor(100000 + Math.random() * 900000);
    user.resetPasswordCode = randamnumber;
    await user.save();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: data.email,
        subject: 'Reset Password',
        text: `This is the password reset code.: ${randamnumber}`
    };
    try {

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log('Email sent: ' + info.response);
            }
        });
        res.status(200).json({ message: "Email sent successfully" });

        console.log(randamnumber);
    } catch (err) {
        console.error('Error sending email:', err);
        res.status(500).json({ error: "Failed to send email" });
    }
});


exports.validateResetPasswordCode = asyncHandler(async (req, res) => {
    const data = {
        code: xss(req.body.code),
        email: xss(req.body.email)
    }
    const { error } = validateResetEmail(data);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const user = await User.findOne({ email: data.email });
    if (!user) return res.status(404).json({ error: "User not found" });
    const userCode = user.resetPasswordCode;
    if (userCode !== data.code) {
        return res.status(400).json({ error: "Invalid code" });

    }
    res.status(200).json({ message: "Code is valid" });
});

function validateResetEmail(data) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
    });
    return schema.validate(data);
}



exports.resetPassword = asyncHandler(async (req, res) => {
    const data = {
        email: xss(req.body.email),
        password: xss(req.body.password),
    }
    const { error } = validateResetPassword(data);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const user = await User.findOne({ email: data.email });
    if (!user) return res.status(404).json({ error: "User not found" });
    const hashedPassword = await bcrypt.hash(data.password, 10);
    user.password = hashedPassword;
    user.resetPasswordCode = null;
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
});



function validateResetPassword(data) {
    const schema = Joi.object({
          password:passwordComplexity() .required()    });
    return schema.validate(data);
}