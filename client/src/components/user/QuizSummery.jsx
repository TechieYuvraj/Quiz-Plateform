import { useEffect, useState } from "react";
import API from "../../../axios.config";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function QuizSummary() {
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchSummary = async () => {
        try {
            const res = await API.get("/api/user/quiz/today/summary");
            setSummary(res.data.summary || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to load quiz summary.");
            navigate("/profile");
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    if (loading) return <p className="text-center mt-20">Loading summary...</p>;
    if (!summary.length) return <p className="text-center mt-20">No quiz summary available.</p>;

    return (
        <div className="max-w-3xl mx-auto mt-10 p-4 border rounded shadow bg-white dark:bg-zinc-900 dark:border-zinc-700 transition-colors">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Quiz Summary</h2>

            {summary.map((item, idx) => {
                const isMCQ = item.type === "mcq";

                let status;
                if (isMCQ) {
                    status = item.userAnswer === item.correctAnswer ? "r" : "w";
                } else {
                    status = item.isCorrect || "p";
                }

                // Color classes for light/dark mode
                const statusClasses = status === "r"
                    ? "border-green-500 bg-green-50 dark:bg-green-950/60 dark:border-green-600"
                    : status === "w"
                        ? "border-red-500 bg-red-50 dark:bg-red-950/60 dark:border-red-600"
                        : "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/60 dark:border-yellow-600";

                const answerTextClass = status === "r"
                    ? "text-green-700 dark:text-green-300"
                    : status === "w"
                        ? "text-red-700 dark:text-red-300"
                        : "text-yellow-700 dark:text-yellow-300";

                const correctAnswerClass = isMCQ
                    ? "text-green-700 dark:text-green-300 font-semibold"
                    : "text-gray-600 dark:text-gray-300 font-semibold";

                return (
                    <div
                        key={idx}
                        className={`mb-4 p-4 rounded border transition-colors ${statusClasses}`}
                    >
                        <p className="font-semibold mb-2 text-gray-900 dark:text-white">
                            Q{idx + 1}: {item.question}
                        </p>

                        <p>
                            <strong className="text-gray-800 dark:text-gray-200">Your Answer:</strong>{" "}
                            <span className={answerTextClass}>
                                {item.userAnswer || "No answer"}
                            </span>
                        </p>

                        <p>
                            <strong className="text-gray-800 dark:text-gray-200">
                                {isMCQ ? "Correct Answer" : "Reference Answer"}:
                            </strong>{" "}
                            <span className={correctAnswerClass}>
                                {item.correctAnswer || "N/A"}
                            </span>
                        </p>

                        <p className="mt-2">
                            <strong className="text-gray-800 dark:text-gray-200">Status:</strong>{" "}
                            <span>
                                {status === "r"
                                    ? "✅ Correct"
                                    : status === "w"
                                        ? "❌ Wrong"
                                        : "⏳ Pending (to be checked by Admin)"}
                            </span>
                        </p>
                    </div>
                );
            })}

            <div className="mt-6 text-center">
                <Button onClick={() => navigate("/profile")}>Back to Profile</Button>
            </div>
        </div>
    );
}
