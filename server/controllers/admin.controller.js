import Admin from "../models/Admin.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Question from "../models/Question.model.js";
import redis from "../utils/redis.util.js";

export const registerAdmin = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const existing = await Admin.findOne({ email });
        if (existing) return res.status(400).json({ message: "Admin already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await Admin.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'moderator',
        });

        const ASTID = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("ASTID", ASTID, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(201).json({
            message: "Admin registered successfully",
            adminId: admin._id,
            role: admin.role,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Registration failed" });
    }
};

export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(404).json({ message: "Admin not found" });
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid password" });
        const ASTID = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        res.cookie("ASTID", ASTID, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.status(200).json({
            message: "Login successful",
            adminId: admin._id,
            role: admin.role,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Login failed" });
    }
};

// export const addQuestion = async (req, res) => {                        // we add htis later if needed

//     try {
//         const { type, text, options, correctAnswer, date, timeWindow } = req.body;
//         // Basic validation
//         if (!type || !text || !date) {
//             return res.status(400).json({ message: "Missing required fields" });
//         }
//         if (type === "mcq") {
//             if (!Array.isArray(options) || options.length < 2) {
//                 return res.status(400).json({ message: "MCQ must have at least 2 options" });
//             }
//             if (typeof correctAnswer !== "number" || correctAnswer >= options.length || correctAnswer < 0) {
//                 return res.status(400).json({ message: "Invalid correct answer index" });
//             }
//         }
//         const question = new Question({
//             type,
//             text,
//             options: type === "mcq" ? options : undefined,
//             correctAnswer: type === "mcq" ? correctAnswer : undefined,
//             date: date.trim(),
//             timeWindow: timeWindow || 20,
//         });
//         await question.save();
//         res.status(201).json({ message: "Question added successfully", question });
//     } catch (err) {
//         console.error("Add question error:", err.message);
//         res.status(500).json({ message: "Server error" });
//     }
// };



export const addQuestion = async (req, res) => {
    try {
        const { type, text, options, correctAnswer, date, timeWindow } = req.body;

        if (!type || !text || !date) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (type === "mcq") {
            if (!Array.isArray(options) || options.length < 2) {
                return res.status(400).json({ message: "MCQ must have at least 2 options" });
            }
            if (typeof correctAnswer !== "number" || correctAnswer >= options.length || correctAnswer < 0) {
                return res.status(400).json({ message: "Invalid correct answer index" });
            }
        }

        const question = new Question({
            type,
            text,
            options: type === "mcq" ? options : undefined,
            correctAnswer: type === "mcq" ? correctAnswer : undefined,
            date: date.trim(),
            timeWindow: timeWindow || 20,
        });

        await question.save();

        //  redis question cache update  for today.... (WORK IN PROGRESS)
        const today = date.trim();
        const questionsForToday = await Question.find({ date: today });
        // console.log(`quiz:${today}`)
        await redis.set(`quiz:${today}`, JSON.stringify(questionsForToday));

        res.status(201).json({ message: "Question added successfully", question });
    } catch (err) {
        console.error("Add question error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};