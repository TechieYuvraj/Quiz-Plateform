import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, required: true },
    college: String,
    course: String,
    year: String,
    password: { type: String, required: true },

    isAdmin: { type: Boolean, default: false },

    lastAttemptDate: { type: Date },           // To track when user last attempted quiz
    score: { type: Number, default: 0 },       // To maintain total score (if using MCQs)
    participatedDays: { type: Number, default: 0 }, // Optional: for leaderboard

}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
