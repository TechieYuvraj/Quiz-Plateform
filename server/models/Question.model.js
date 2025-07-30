import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["mcq", "descriptive"],
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    options: {
        type: [String], // e.g., ["Option A", "Option B", "Option C"]
        default: [],
    },
    correctAnswer: {
        type: String,
        default: null, // only for MCQ; for descriptive, this stays null
    },
    date: {
        type: String,
        required: true, // store as "YYYY-MM-DD" string for daily lookup
    },
    timeWindow: {
        type: Number,
        default: 20, // seconds; you can change per question while adding
        min: 5,
        max: 120,
    },
}, { timestamps: true });

const Question = mongoose.model("Question", questionSchema);
export default Question;
