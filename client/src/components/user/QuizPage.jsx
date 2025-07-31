import { useEffect, useState } from "react";
import API from "../../../axios.config";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function QuizPage() {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    // ✅ Step 1: Fetch today's questions
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await API.get("api/user/quiz/today");
                setQuestions(res.data.questions);
                setCurrentIndex(0);
                setLoading(false);
            } catch (err) {
                toast.error("Failed to load quiz.");
                navigate("/profile");
            }
        };

        fetchQuestions();
    }, []);

    // ✅ Step 2: When question changes, set timeLeft
    useEffect(() => {
        if (questions.length > 0) {
            const newTime = questions[currentIndex]?.timeWindow || 20;
            setTimeLeft(newTime);
        }
    }, [currentIndex, questions]);

    // ✅ Step 3: Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === 1) {
                    clearInterval(timer);
                    handleNext(); // auto-submit or skip
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // ✅ Move to next question
    const handleNext = () => {
        // TODO: Save answer to backend here if needed
        setSelectedAnswer(null);
        const nextIndex = currentIndex + 1;

        if (nextIndex < questions.length) {
            setCurrentIndex(nextIndex);
        } else {
            toast.success("Quiz completed!");
            navigate("/profile");
        }
    };

    if (loading) return <p className="text-center mt-20">Loading quiz...</p>;

    const question = questions[currentIndex];

    return (
        <div className="max-w-2xl mx-auto mt-10 p-4 border rounded shadow">
            <div className="flex justify-between mb-2">
                <h2 className="font-semibold text-lg">Question {currentIndex + 1} of {questions.length}</h2>
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
                />
            )}

            <div className="mt-6 text-right">
                <Button onClick={handleNext}>Next</Button>
            </div>
        </div>
    );
}
