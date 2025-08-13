import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user.route.js';
import adminRoutes from './routes/admin.route.js'
import { one_day_question_update_CRON } from './utils/cron/question.cron.js';

dotenv.config();
const app = express();
app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Root route

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 4000, () => {
            console.log(`⚙️ Server running on port ${process.env.PORT || 4000}`);
        });
    })
    .catch((error) => {
        console.error(`Error server.js :::> ${error}`);
        process.exit(1);
    });

one_day_question_update_CRON()

app.get("/", (req, res) => {
    res.send("hello CG quiz :)");
});