// controllers/quizController.js
import Question from "../models/Question.model.js"
import Attempt from "../models/Attempt.model.js"
import redis from "../utils/redis.util.js"

export const getTodayQuizByIndex = async (req, res) => {
    try {
        const { userId, index } = req.body
        console.log(req.body)

        if (!userId) {
            console.log("User ID not found.")
            return res.status(400).json({ message: "User ID not found." })
        }

        if (isNaN(index) || index < 0) {
            console.log("Invalid question index.")
            return res.status(400).json({ message: "Invalid question index." })
        }

        const indianDate = new Intl.DateTimeFormat("en-CA", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            timeZone: "Asia/Kolkata"
        }).format(new Date())

        const redisKey = `quiz:${indianDate}`
        let questions = await redis.get(redisKey)
        questions = JSON.parse(questions)

        if (!questions || !questions.length) {
            console.log("Redis empty, fetching from DB")
            questions = await Question.find({ date: indianDate })
            if (!questions.length) {
                return res.status(404).json({ message: "No quiz found for today." })
            }
            await redis.set(redisKey, JSON.stringify(questions))
        } else {
            console.log("Fetched from Redis")
        }

        if (index >= questions.length) {
            return res.status(404).json({ message: "Question index out of bounds." })
        }

        const currentQuestion = questions[index]

        const alreadyAttempted = await Attempt.findOne({
            user: userId,
            question: currentQuestion._id,
            date: indianDate
        })

        if (alreadyAttempted) {
            return res.status(200).json({ attempted: true })
        }

        const { correctAnswer, ...safeQuestion } = currentQuestion

        const startTimeKey = `quiz:startTime:${userId}:${indianDate}:${index}`
        let startTime = await redis.get(startTimeKey)

        if (!startTime) {
            startTime = Date.now()
            await redis.set(startTimeKey, startTime, "EX", 86400)
            console.log(`New startTime set for user ${userId}, qIndex ${index}: ${startTime}`)
        } else {
            startTime = parseInt(startTime, 10)
            console.log(`Existing startTime found for user ${userId}, qIndex ${index}: ${startTime}`)
        }

        res.status(200).json({
            attempted: false,
            index,
            total: questions.length,
            question: safeQuestion,
            startTime
        })

    } catch (err) {
        console.error("Error fetching quiz question:", err.message)
        res.status(500).json({ message: "Server error while fetching question." })
    }
}

export const AddAttemptAndGetAnswerByIndex = async (req, res) => {
    try {
        const { userId, questionId, answer, timeTaken, index } = req.body;

        if (!userId || !questionId || answer === undefined || index === undefined) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const indianDate = new Intl.DateTimeFormat("en-CA", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            timeZone: "Asia/Kolkata"
        }).format(new Date());

        const redisKey = `quiz:${indianDate}`;
        const cached = await redis.get(redisKey);
        const questions = JSON.parse(cached);

        if (!questions || !questions.length) {
            return res.status(404).json({ message: "No quiz found for today." });
        }

        if (index >= questions.length) {
            return res.status(404).json({ message: "Question index out of bounds." });
        }

        const currentQuestion = questions[index];
        const correctAnswer = currentQuestion?.correctAnswer ?? null;

        const attemptData = {
            user: userId,
            question: questionId,
            answer,
            date: indianDate,
            timeTaken: timeTaken + 1 || 0
        };

        if (currentQuestion?.type === "descriptive") {
            attemptData.isCorrect = "p"; // pending
        }

        await Attempt.create(attemptData);

        return res.status(200).json({
            message: "Attempt recorded successfully.",
            correctAnswer
        })

    } catch (err) {
        console.error("Error in AddAttemptAndGetAnswerByIndex:", err.message);
        return res.status(500).json({ message: "Server error while saving attempt." });
    }
}



export const getTodayQuizSummary = async (req, res) => {
    try {
        const userId = req.userId  //  from verifyToken
        if (!userId) {
            return res.status(400).json({ message: "User ID not found in token." })
        }

        const indianDate = new Intl.DateTimeFormat("en-CA", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            timeZone: "Asia/Kolkata"
        }).format(new Date())

        const attempts = await Attempt.find({ user: userId, date: indianDate })

        const redisKey = `quiz:${indianDate}`
        const cached = await redis.get(redisKey)
        const questions = cached ? JSON.parse(cached) : []

        const summary = attempts.map(a => {
            const q = questions.find(q => q._id === String(a.question))
            return {
                type: q.type,
                question: q?.text || "Question not found",
                userAnswer: a.answer,
                correctAnswer: q?.correctAnswer || null
            }
        })

        return res.status(200).json({ summary })
    } catch (err) {
        console.error("Error in getTodayQuizSummary:", err.message)
        return res.status(500).json({ message: "Server error while fetching summary." })
    }
} 
