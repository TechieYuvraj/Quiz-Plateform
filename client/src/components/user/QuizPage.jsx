import { useEffect, useState } from "react";
import API from "../../../axios.config";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSelector } from "react-redux";

export default function QuizPage() {
    const [question, setQuestion] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(null);

    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const userId = user?._id;

    const fetchQuestion = async (index) => {
        try {
            const res = await API.post("/api/user/quiz/today", { userId, index });

            if (res.data.attempted) {
                toast.info("You have already attempted today's quiz.");
                navigate("/profile");
                return;
            }

            setQuestion(res.data.question);
            setTimeLeft(res.data.question?.timeWindow || 20);
            setShowAnswer(null); // reset correct answer display
            setSelectedAnswer(null);
            setLoading(false);
        } catch (err) {
            console.error("ERROR", err.response?.data?.message || err.message);
            toast.error(err.response?.data?.message || "Failed to load quiz question.");
            navigate("/profile");
        }
    };

    useEffect(() => {
        if (!userId) {
            toast.error("User not found.");
            navigate("/profile");
            return;
        }
        fetchQuestion(currentIndex);
    }, [currentIndex, userId]);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === 1) {
                    clearInterval(timer);
                    handleSubmit();
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleSubmit = async () => {          // WoRk In PrOgReSs
        if (!question) return;

        try {
            const res = await API.post("/api/user/quiz/attempt", {
                userId,
                questionId: question._id,
                answer: selectedAnswer ?? "",
                timeTaken: (question.timeWindow || 20) - timeLeft,
                index: currentIndex
            });

            toast.success("Answer submitted!");
            setShowAnswer(res.data.correctAnswer);

        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to submit answer.");
        }
    };

    const handleNext = () => {
        setCurrentIndex((prev) => prev + 1);
    };

    if (loading) return <p className="text-center mt-20">Loading quiz...</p>;
    if (!question) return <p className="text-center mt-20">No question found.</p>;

    return (
        <div className="max-w-2xl mx-auto mt-10 p-4 border rounded shadow">
            <div className="flex justify-between mb-2">
                <h2 className="font-semibold text-lg">Question {currentIndex + 1}</h2>
                <p className="text-red-500 font-bold">⏱ {timeLeft}s</p>
            </div>

            <p className="text-md mb-4">{question.text}</p>

            {question.type === "mcq" ? (
                <div className="space-y-2">
                    {question.options.map((opt, i) => (
                        <Button
                            key={i}
                            variant={selectedAnswer === i ? "default" : "outline"}
                            className="w-full justify-start"
                            onClick={() => setSelectedAnswer(i)}
                            disabled={showAnswer !== null} // disable after submission
                        >
                            {opt}
                        </Button>
                    ))}
                </div>
            ) : (
                <textarea
                    className="w-full border p-2 mt-2"
                    rows={4}
                    placeholder="Write your answer..."
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    value={selectedAnswer || ""}
                    disabled={showAnswer !== null}
                />
            )}

            {showAnswer !== null && (
                <div className="mt-4 p-3 border rounded bg-green-50 text-green-700">
                    Correct Answer: <strong>{showAnswer}</strong>
                </div>
            )}

            <div className="mt-6 flex justify-between">
                <Button
                    variant="secondary"
                    onClick={handleSubmit}
                    disabled={showAnswer !== null}
                >
                    Submit
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={showAnswer === null}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
