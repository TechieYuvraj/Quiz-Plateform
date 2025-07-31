// controllers/quizController.js
import Question from "../models/Question.model.js";
import Attempt from "../models/Attempt.model.js";

export const getTodayQuiz = async (req, res) => {

    try {
        const userId = req.userId;
        // const userId = "6886fa2d729aa45d7d3a4c81";

        console.log("user id is ",req.userId)
        // console.log(req.userId)
        if (!userId) { return res.status(400).json({ message: "useris not found" }); }
        // const todayStr = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
        const todayLocal = new Date();
        const todayStr = todayLocal.toLocaleDateString("en-CA")
        console.log("todays date is: ", todayStr)
        // 1. Check if user already attempted
        const alreadyAttempted = await Attempt.findOne({
            user: userId,
            date: todayStr,
        });

        if (alreadyAttempted) {
            return res.status(200).json({ attempted: true });
        }

        // 2. Fetch today's questions
        const questions = await Question.find({ date: todayStr }).select("-correctAnswer");

        if (!questions.length) {
            return res.status(404).json({ message: "No questions available for today." });
        }

        res.status(200).json({ attempted: false, questions });
    } catch (err) {
        console.error("Error fetching quiz:", err.message);
        res.status(500).json({ message: "Server error while fetching quiz." });
    }
};