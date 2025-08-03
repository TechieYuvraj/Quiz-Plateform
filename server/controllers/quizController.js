// controllers/quizController.js
import Question from "../models/Question.model.js";
import Attempt from "../models/Attempt.model.js";
import redis from "../utils/redis.util.js";

// export const getTodayQuiz = async (req, res) => {
//     try {
//         const userId = req.userId;
//         console.log("user id is ", req.userId)
//         // console.log(req.userId)
//         if (!userId) { return res.status(400).json({ message: "useris not found" }); }
//         // const todayStr = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
//         const todayLocal = new Date();
//         const todayStr = todayLocal.toLocaleDateString("en-CA")
//         console.log("todays date is: ", todayStr)
//         // checking if user already attempted
//         const alreadyAttempted = await Attempt.findOne({
//             user: userId,
//             date: todayStr,
//         });

//         if (alreadyAttempted) {
//             return res.status(200).json({ attempted: true });
//         }

//         // getting question from redis
//         let yourDate = new Date();
//         let indianDate = new Intl.DateTimeFormat('en-CA', {
//             year: 'numeric',
//             month: '2-digit',
//             day: '2-digit',
//             timeZone: 'Asia/Kolkata'
//         }).format(yourDate);

//         const today = indianDate.trim();
//         console.log(`quiz:${today}`)
//         const ok = await redis.get(`quiz:${today}`)
//         const questions = JSON.parse(ok)
//         console.log("QUESTIONS ", questions)
//         if (!questions.length) {
//             return res.status(404).json({ message: "No questions available for today." });
//         }

//         res.status(200).json({ attempted: false, questions });
//     } catch (err) {
//         console.error("Error fetching quiz:", err.message);
//         res.status(500).json({ message: "Server error while fetching quiz." });
//     }
// };


export const getTodayQuizByIndex = async (req, res) => {
    try {
        const { userId, index } = req.body;

        if (!userId) {
            console.log("User ID not found.")
            return res.status(400).json({ message: "User ID not found." });
        }

        if (isNaN(index) || index < 0) {
            console.log("Invalid question index.")
            return res.status(400).json({ message: "Invalid question index." });
        }

        const todayLocal = new Date();
        const todayStr = todayLocal.toLocaleDateString("en-CA");

        const alreadyAttempted = await Attempt.findOne({
            user: userId,
            date: todayStr,
        });

        if (alreadyAttempted) {
            return res.status(200).json({ attempted: true });
        }

        const indianDate = new Intl.DateTimeFormat('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'Asia/Kolkata'
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

        const { correctAnswer, ...safeQuestion } = questions[index]; // exclude

        res.status(200).json({
            attempted: false,
            index,
            total: questions.length,
            question: safeQuestion
        });

    } catch (err) {
        console.error("Error fetching quiz question:", err.message);
        res.status(500).json({ message: "Server error while fetching question." });
    }
}


export const AddAttemptAndGetAnswerByIndex = async (req, res) => {
    try {
        const { userId, questionId, answer, timeTaken, index } = req.body;

        if (!userId || !questionId || answer === undefined || index === undefined) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        // Format today's date (India timezone)
        const indianDate = new Intl.DateTimeFormat("en-CA", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            timeZone: "Asia/Kolkata"
        }).format(new Date());

        await Attempt.create({
            user: new mongoose.Types.ObjectId(userId),
            question: new mongoose.Types.ObjectId(questionId),
            answer,
            date: indianDate,
            timeTaken: timeTaken || 0
        });

        // answer redis fetch
        const redisKey = `quiz:${indianDate}`;
        const cached = await redis.get(redisKey);
        const questions = JSON.parse(cached);

        if (!questions || !questions.length) {
            return res.status(404).json({ message: "No quiz found for today." });
        }

        if (index >= questions.length) {
            return res.status(404).json({ message: "Question index out of bounds." });
        }

        const correctAnswer = questions[index]?.correctAnswer ?? null;

        return res.status(200).json({
            message: "Attempt recorded successfully.",
            correctAnswer
        });

    } catch (err) {
        console.error("Error in AddAttemptAndGetAnswerByIndex:", err.message);
        return res.status(500).json({ message: "Server error while saving attempt." });
    }
};