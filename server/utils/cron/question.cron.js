import cron from "node-cron";
import redis from "../redis.util.js";
import Question from "../../models/Question.model.js";

// Schedule: Run every day at 12:01 AM
export async function one_day_question_update_CRON() {
    cron.schedule("1 0 * * *", async () => { // will change cron expression to 1 0 * * * for 12:01 am
        try {
            const today = new Intl.DateTimeFormat("en-CA", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                timeZone: "Asia/Kolkata"
            }).format(new Date());
            const questions = await Question.find({ date: today });
            console.log(today);

            // Optional: use a consistent Redis key
            await redis.set(`quiz:${today}`, JSON.stringify(questions));

            console.log(`[CRON] Cached ${questions.length} questions for ${today}`);
        } catch (err) {
            console.error("[CRON] Error caching today's questions:", err.message);
        }
    }, {
        timezone: "Asia/Kolkata" // indain timezone
    });
}


// 6 0 * * *
