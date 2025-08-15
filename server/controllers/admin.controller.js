import Admin from "../models/Admin.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Question from "../models/Question.model.js";
import User from "../models/User.model.js"
import redis from "../utils/redis.util.js";
import Attempt from "../models/Attempt.model.js";

export const registerAdmin = async (req, res) => {
    const { name, email, password, role, secretKey } = req.body;

    try {
        const existing = await Admin.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        let finalRole;

        if (role === "superadmin") {
            // Superadmin creation requires secret key
            if (secretKey !== process.env.ADMIN_REGISTRATION_KEY) {
                return res.status(403).json({ message: "Invalid secret key for superadmin registration" });
            }
            finalRole = "superadmin";
        }
        else if (role === "moderator") {
            const token = req.cookies?.ASTID;
            if (!token) {
                return res.status(403).json({ message: "Only a logged-in superadmin can create moderators" });
            }

            let decoded;
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET);
            } catch (err) {
                return res.status(403).json({ message: "Invalid or expired superadmin token" });
            }

            const admin = await Admin.findById(decoded.id);
            if (!admin || admin.role !== "superadmin") {
                return res.status(403).json({ message: "Only a superadmin can create moderators" });
            }
            finalRole = "moderator";
        }
        else {
            return res.status(400).json({ message: "Invalid role specified" });
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newAdmin = await Admin.create({
            name,
            email,
            password: hashedPassword,
            role: finalRole,
        })

        const ASTID = jwt.sign(
            { id: newAdmin._id, role: newAdmin.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        res.cookie("ASTID", ASTID, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        res.status(201).json({
            message: `${finalRole} registered successfully`,
            adminId: newAdmin._id,
            role: newAdmin.role,
        });

    } catch (err) {
        console.error("Error registering admin:", err);
        res.status(500).json({ message: "Registration failed" });
    }
}


export const loginAdmin = async (req, res) => {
    const { identifier, password, rememberMe } = req.body;
    try {
        // Match either email or name
        const admin = await Admin.findOne({
            $or: [{ email: identifier }, { name: identifier }]
        });

        if (!admin) return res.status(404).json({ message: "Admin not found" });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid password" });

        // If rememberMe is true → 30 days, else 7 days
        const expiryDays = rememberMe ? 30 : 7;

        const ASTID = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, {
            expiresIn: `${expiryDays}d`,
        });

        res.cookie("ASTID", ASTID, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: expiryDays * 24 * 60 * 60 * 1000, // in ms
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

export const getAdminProfile = async (req, res) => {
    try {
        // req.admin from miiddleware
        const admin = req.admin;

        res.status(200).json({
            name: admin.name,
            email: admin.email,
            role: admin.role,
            createdAt: admin.createdAt,
        });
    } catch (err) {
        console.error("Error fetching admin profile:", err);
        res.status(500).json({ message: "Failed to fetch admin profile" });
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

export const getDashboardStats = async (req, res) => {
    try {
        // Format today's date in India timezone
        const indianDate = new Intl.DateTimeFormat('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'Asia/Kolkata'
        }).format(new Date());

        // Fetch today's quizzes from Redis or DB
        const redisKey = `quiz:${indianDate}`;
        let questions = await redis.get(redisKey);

        if (questions) {
            console.log("Fetched today's quizzes from Redis");
            questions = JSON.parse(questions);
        } else {
            console.log("Redis empty, fetching today's quizzes from DB");
            questions = await Question.find({ date: indianDate });

            if (questions.length > 0) {
                await redis.set(redisKey, JSON.stringify(questions));
            }
        }

        const totalUsers = await User.countDocuments();

        const pendingReviews = await Attempt.countDocuments({
            date: indianDate,
            isCorrect: "p" // pending
        });

        res.status(200).json({
            date: indianDate,
            todaysQuizzes: questions.length,
            totalUsers,
            pendingReviews,
            // quizzes: questions
        });

    } catch (err) {
        console.error("Error fetching dashboard stats:", err.message);
        res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
};


//  imp stuff

// controllers/admin.controller.js

export const getAllQuestions = async (req, res) => {
    try {
        let { page = 1, limit = 10, type, search, date } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        const query = {};

        // Filter by type
        if (type && ["mcq", "descriptive"].includes(type.toLowerCase())) {
            query.type = type.toLowerCase();
        }

        // Filter by date (YYYY-MM-DD)
        if (date) {
            query.date = date;
        }

        // Search by question text (case-insensitive)
        if (search) {
            query.text = { $regex: search, $options: "i" };
        }

        const total = await Question.countDocuments(query);
        const questions = await Question.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            questions,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalQuestions: total
        });

    } catch (err) {
        console.error("Error fetching questions:", err.message);
        res.status(500).json({ message: "Failed to fetch questions" });
    }
};

// controllers/admin.controller.js
export const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        // Find and delete in one go
        const question = await Question.findByIdAndDelete(id);

        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        // Invalidate cache for that date (if exists)
        const redisKey = `quiz:${question.date}`;
        const cached = await redis.get(redisKey);
        if (cached) {
            let arr = JSON.parse(cached);
            arr = arr.filter(q => q._id.toString() !== id);
            await redis.set(redisKey, JSON.stringify(arr));
        }

        res.status(200).json({ message: "Question deleted successfully" });

    } catch (err) {
        console.error("Error deleting question:", err.message);
        res.status(500).json({ message: "Failed to delete question" });
    }
};

export const editQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, text, options, correctAnswer, date, timeWindow } = req.body;

        // Validate inputs (basic check)
        if (!type || !text || !date) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Update question in DB
        const updatedQuestion = await Question.findByIdAndUpdate(
            id,
            { type, text, options, correctAnswer, date, timeWindow },
            { new: true }
        );

        if (!updatedQuestion) {
            return res.status(404).json({ message: "Question not found" });
        }

        // Update Redis cache if exists
        const redisKey = `quiz:${date}`;
        const cached = await redis.get(redisKey);
        if (cached) {
            let arr = JSON.parse(cached);
            const index = arr.findIndex(q => q._id.toString() === id);
            if (index !== -1) {
                arr[index] = updatedQuestion;
                await redis.set(redisKey, JSON.stringify(arr));
            }
        }

        res.status(200).json({
            message: "Question updated successfully",
            question: updatedQuestion
        });

    } catch (err) {
        console.error("Error editing question:", err.message);
        res.status(500).json({ message: "Failed to edit question" });
    }
};


// complex stuff
export const viewResultPageDetails = async (req, res) => {
    try {
        let { date, search = "", page = 1, limit = 10 } = req.query;

        if (!date) {
            return res.status(400).json({ message: "Date is required" });
        }

        page = parseInt(page);
        limit = parseInt(limit);

        const matchStage = { date };

        const pipeline = [
            { $match: matchStage },

            // Get user details
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },

            // Get question details
            {
                $lookup: {
                    from: "questions",
                    localField: "question",
                    foreignField: "_id",
                    as: "questionDetails"
                }
            },
            { $unwind: "$questionDetails" },

            // Optional search filter by name
            {
                $match: search
                    ? { "userDetails.name": { $regex: search, $options: "i" } }
                    : {}
            },

            // Group by user
            {
                $group: {
                    _id: "$user",
                    userDetails: { $first: "$userDetails" },
                    attempts: { $push: "$$ROOT" }
                }
            }
        ];

        const groupedResults = await Attempt.aggregate(pipeline);

        const scoredResults = groupedResults.map((userData) => {
            let score = 0;
            let totalQuestions = userData.attempts.length;

            userData.attempts.forEach((attempt) => {
                const q = attempt.questionDetails;

                if (q.type === "mcq") {
                    const correctIndex = Number(q.correctAnswer);
                    if (Number(attempt.answer) === correctIndex) {
                        score += 4;
                        if (attempt.timeTaken > 0 && q.timeWindow > 0) {
                            let bonus = Math.max(0, 2 - attempt.timeTaken / q.timeWindow);
                            score += bonus;
                        }
                    }
                } else if (q.type === "descriptive") {
                    if (attempt.isCorrect === "r") {
                        score += 4;
                        if (attempt.timeTaken > 0 && q.timeWindow > 0) {
                            let bonus = Math.max(0, 2 - attempt.timeTaken / q.timeWindow);
                            score += bonus;
                        }
                    }
                }
            });

            // Now denominator is totalQuestions * 6
            const percentage = totalQuestions > 0
                ? ((score / (totalQuestions * 6)) * 100).toFixed(2)
                : "0.00";

            return {
                userId: userData._id,
                name: userData.userDetails.name,
                score: Number(score.toFixed(2)),
                percentage: Number(percentage),
                totalQuestions
            };
        });

        // Sort by score desc, then percentage desc
        scoredResults.sort((a, b) => {
            if (b.score === a.score) return b.percentage - a.percentage;
            return b.score - a.score;
        });

        // Assign ranks
        scoredResults.forEach((item, index) => {
            item.rank = index + 1;
        });

        // Pagination
        const totalResults = scoredResults.length;
        const paginatedResults = scoredResults.slice((page - 1) * limit, page * limit);

        res.status(200).json({
            date,
            results: paginatedResults,
            totalResults,
            currentPage: page,
            totalPages: Math.ceil(totalResults / limit)
        });
    } catch (err) {
        console.error("Error fetching quiz results:", err.message);
        res.status(500).json({ message: "Failed to fetch quiz results" });
    }
};





export const viewStudentAnswers = async (req, res) => {
    try {
        const { date, userId } = req.query;

        if (!date || !userId) {
            return res.status(400).json({ message: "Date and userId are required" });
        }

        // Fetch the attempt document for that student and date
        const attemptDoc = await Attempt.findOne({ userId, date });
        if (!attemptDoc) {
            return res.status(404).json({ message: "No attempts found for this user on this date" });
        }

        // Get all question IDs from attempts
        const questionIds = attemptDoc.attempts.map(a => a.questionId);

        // Fetch the actual questions
        const questions = await Question.find({ _id: { $in: questionIds } });

        // Build detailed answer data
        const detailedAnswers = attemptDoc.attempts.map((a) => {
            const question = questions.find(q => q._id.toString() === a.questionId.toString());
            return {
                questionId: question?._id,
                questionText: question?.text,
                options: question?.type === "mcq" ? question?.options : undefined,
                type: question?.type,
                userAnswer: a.answer,
                correctAnswer: question?.correctAnswer,
                isCorrect: a.isCorrect, // "r" = right, "w" = wrong, "p" = pending
                timeTaken: a.timeTaken
            };
        });

        res.status(200).json({
            date,
            userId,
            name: attemptDoc.userName, // If stored in Attempt
            answers: detailedAnswers
        });

    } catch (err) {
        console.error("Error fetching student answers:", err.message);
        res.status(500).json({ message: "Failed to fetch student answers" });
    }
};
