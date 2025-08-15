import { useEffect, useState } from "react" 
import API from "../../../axios.config" 
import { Button } from "@/components/ui/button" 
import { toast } from "sonner" 
import { useNavigate } from "react-router-dom" 

export default function QuizSummary() {
    const [summary, setSummary] = useState([]) 
    const [loading, setLoading] = useState(true) 
    const navigate = useNavigate() 

    const fetchSummary = async () => {
        try {
            const res = await API.get("/api/user/quiz/today/summary") 
            setSummary(res.data.summary || []) 
            setLoading(false) 
        } catch (err) {
            console.error(err) 
            toast.error(err.response?.data?.message || "Failed to load quiz summary.") 
            navigate("/profile") 
        }
    } 

    useEffect(() => {
        fetchSummary() 
    }, []) 

    if (loading) return <p className="text-center mt-20">Loading summary...</p> 
    if (!summary.length) return <p className="text-center mt-20">No quiz summary available.</p> 

    return (
        <div className="max-w-3xl mx-auto mt-10 p-4 border rounded shadow">
            <h2 className="text-2xl font-bold mb-6">Quiz Summary</h2>

            {summary.map((item, idx) => {
                // console.log(item)
                const isMCQ = item.type === "mcq" 
                const isCorrect = isMCQ && item.userAnswer === item.correctAnswer 

                return (
                    <div
                        key={idx}
                        className={`mb-4 p-4 rounded border ${isMCQ
                            ? isCorrect
                                ? "border-green-500 bg-green-50"
                                : "border-red-500 bg-red-50"
                            : "border-gray-300 bg-gray-50"
                            }`}
                    >
                        <p className="font-semibold mb-2">
                            Q{idx + 1}: {item.question}
                        </p>

                        <p>
                            Your Answer:{" "}
                            <span
                                className={
                                    isMCQ
                                        ? isCorrect
                                            ? "text-green-700"
                                            : "text-red-700"
                                        : "text-black"
                                }
                            >
                                {item.userAnswer || "No answer"}
                            </span>
                        </p>

                        <p>
                            Correct Answer:{" "}
                            <span
                                className={
                                    isMCQ
                                        ? "text-green-700 font-semibold"
                                        : "text-black font-semibold"
                                }
                            >
                                {isMCQ ? item.correctAnswer : "N/A"}
                                {/* {isMCQ ? item.correctAnswer : item.correctAnswer} */}
                            </span>
                        </p>
                    </div>
                ) 
            })}

            <div className="mt-6 text-center">
                <Button onClick={() => navigate("/profile")}>Back to Profile</Button>
            </div>
        </div>
    ) 
}
