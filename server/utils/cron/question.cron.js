import cron from "node-cron";
import redis from "../redis.util.js";
import Question from "../../models/Question.model.js";

// Schedule: Run every day at 12:01 AM
cron.schedule("1 0 * * *", async () => {
    try {
        const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
        const questions = await Question.find({ date: today });

        // Optional: use a consistent Redis key
        await redis.set(`quiz:${today}`, JSON.stringify(questions));

        console.log(`[CRON] Cached ${questions.length} questions for ${today}`);
    } catch (err) {
        console.error("[CRON] Error caching today's questions:", err.message);
    }
});
