import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",             //Refers to the user who submitted the answer
        required: true,
        index: true
    },
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",         //  Refers to the question being answered
        required: true,
        index: true
    },
    answer: {
        type: String,            //  Can be MCQ option ("A", "B", etc) or full text for descriptive
        required: true,
    },
    date: {
        type: String,            // Format: "YYYY-MM-DD"
        required: true,
    },
    timeTaken: {
        type: Number,            // How long the user took to answer, in seconds
        default: 0,
    },
}, { timestamps: true });    //Adds createdAt and updatedAt automatically

const Attempt = mongoose.model("Attempt", attemptSchema);
export default Attempt