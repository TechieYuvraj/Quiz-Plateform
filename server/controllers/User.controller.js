import User from '../models/User.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import otpStore from '../utils/otpStore.util.js';
import { sendOtpEmail, sendOtpEmail_login } from '../utils/sendOtpEmail.util.js';

export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        console.log("Email sending to: ", email)

        if (!email) return res.status(400).json({ message: "Email required" });

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'User already exists' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

        otpStore.set(email, { otp, expiresAt });

        await sendOtpEmail(email, otp);
        res.json({ message: 'OTP sent to email' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
};

export const verifyAndRegister = async (req, res) => {
    const { name, email, phone, college, course, year, password, otp } = req.body;
    console.table(req.body)

    const stored = otpStore.get(email);
    if (!stored) return res.status(400).json({ message: 'No OTP sent or expired' });

    if (stored.expiresAt < Date.now()) {
        otpStore.delete(email);
        return res.status(400).json({ message: 'OTP expired' });
    }

    if (stored.otp !== otp)
        return res.status(400).json({ message: 'Invalid OTP' });

    otpStore.delete(email);

    try {
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({
            name, email, phone, college, course, year, password: hashed
        });

        const STID = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie("STID", STID, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax", // or "Strict" for more security
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({ userId: user._id, message: "Registered & Logged In" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error registering user' });
    }
};


export const sendLoginOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No user found with this email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

    otpStore.set(email, { otp, expiresAt });

    try {
        await sendOtpEmail_login(email, otp);
        res.status(200).json({ message: "OTP sent to email" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to send OTP" });
    }
};

export const verifyLoginOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

    const stored = otpStore.get(email);
    if (!stored) return res.status(400).json({ message: "No OTP sent or expired" });

    if (stored.expiresAt < Date.now()) {
        otpStore.delete(email);
        return res.status(400).json({ message: "OTP expired" });
    }

    if (stored.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    otpStore.delete(email);

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const STID = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie("STID", STID, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax", // or "Strict" for more security
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({ userId: user._id });
};

export const getUserProfile = async (req, res) => {
    try {
        // console.log(req.userId)
        const user = await User.findById(req.userId).select("-password");

        // console.log(user)

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: "Error fetching profile" });
    }
};

export const logoutUser = (req, res) => {
    res.clearCookie("STID", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    })
        .status(200)
        .json({ message: "Logged out successfully" });
};