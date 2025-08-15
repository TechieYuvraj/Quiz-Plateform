import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
        index: true
    },
    answer: {
        type: String,
        default: ""
    },
    date: {
        type: String, // "YYYY-MM-DD"
        required: true,
    },
    timeTaken: {
        type: Number,
        default: 0,
    },
    isCorrect: {
        type: String,
        enum: ['p', 'r', 'w'],
        default: undefined // only for descriptive
    }
}, { timestamps: true });

const Attempt = mongoose.model("Attempt", attemptSchema);
export default Attempt;
