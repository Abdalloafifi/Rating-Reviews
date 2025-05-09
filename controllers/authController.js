const Auth= require('../models/auth');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');
const passwordComplexity = require("joi-password-complexity");
const xss = require('xss');
const Joi = require('joi');
const nodemailer = require('nodemailer');
const { generateTokenAndSend } = require('../middlewares/genarattokenandcookies');


exports.register = asyncHandler(async (req, res) => {
    const data = {
        username: xss(req.body.username),
        email: xss(req.body.email),
        password: xss(req.body.password),
    };
    const { error } = validateRegister(data);
    if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
    }
    const user = await Auth.findOne({ email: data.email });
    if (user) {
        res.status(400).json({ error: "Email already exists" });
        return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const randamnumber = Math.floor(100000 + Math.random() * 900000);

    const newUser = new Auth({
        username: data.username,
        password: hashedPassword,
        email:  data.email,
        number: randamnumber,
        

    });
    await newUser.save();
    // send email
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: data.email,
        subject: 'Your Verification Code',
        text: `Your verification code is: ${randamnumber}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ error: "Failed to send email" });
        }
    });
    res.status(200).json({ message: 'User created successfully Check your email' });
});

function validateRegister(data) {
    const schema = Joi.object({
        username: Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: passwordComplexity().required(),
    });
    return schema.validate(data);
}
exports.verify = asyncHandler(async (req, res) => {
    const data = {
        email: xss(req.body.email),
        code: Number(xss(req.body.code)),
    };
    const { error } = validateVerify(data);
    if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
    }
    const user = await Auth.findOne({ email: data.email });
    if (!user) return res.status(400).json({ error: "Invalid email or code" });
    
    if (user.number !== data.code) return res.status(401).json({ error: "Invalid email or code" });
    
    user.isVerified = true;
    await user.save();
    generateTokenAndSend(user, res);
    res.status(200).json({ message: "Email verified successfully" });
});
function validateVerify(data) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        code: Joi.number().required(),
    });
    return schema.validate(data);
}

exports.login = asyncHandler(async (req, res) => {
    const data = {
        email: xss(req.body.email),
        password: xss(req.body.password),
    };
    const { error } = validateLogin(data);
    if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
    }
    const user = await Auth.findOne({ email: data.email , isVerified: true });
    if (!user) {
        res.status(401).json({ error: "user not found" });
        return;
    }
    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) {
        res.status(400).json({ error: "Invalid email or password" });
        return;
    }
    generateTokenAndSend(user, res);
    res.status(200).json({ message: 'Logged in successfully' });
});
function validateLogin(data) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });
    return schema.validate(data);
}


exports.logout = asyncHandler(async (req, res) => {
    res.header('Authorization', '');
    res.header('x-auth-token', '');
    res.status(200).json({ message: 'Logged out successfully' });
});

exports.deleteUser = asyncHandler(async (req, res) => {
   const user = await Auth.findOneAndDelete(req.user._id);
    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
});
