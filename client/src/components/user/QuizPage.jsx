import { useEffect, useState } from "react"
import API from "../../../axios.config"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useSelector } from "react-redux"

export default function QuizPage() {
    const [question, setQuestion] = useState(null)
    const [timeLeft, setTimeLeft] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [showAnswer, setShowAnswer] = useState(null)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const [totalQuestions, setTotalQuestions] = useState(0)


    const navigate = useNavigate()
    const user = useSelector((state) => state.auth.user)
    const userId = user?._id

    const fetchQuestion = async (index) => {
        try {
            const res = await API.post("/api/user/quiz/today", { userId, index })

            if (res.data.attempted) {
                console.log(`Question ${index} already attempted, skipping...`)
                setCurrentIndex(prev => prev + 1)
                return
            }

            const q = res.data.question
            const startTime = res.data.startTime
            console.log(startTime)
            const timeWindow = q?.timeWindow || 20

            const elapsed = Math.floor((Date.now() - startTime) / 1000)
            const remaining = Math.max(timeWindow - elapsed, 0)

            setQuestion(q)
            setTimeLeft(remaining)
            setShowAnswer(null)
            setSelectedAnswer(null)
            setIsSubmitted(false)
            setLoading(false)
            setTotalQuestions(res.data.total)

        } catch (err) {
            const msg = err.response?.data?.message || err.message

            if (msg.includes("Question index out of bounds")) {
                toast.success("You’ve completed today’s quiz!")
                navigate("/quiz/summary")
            } else {
                toast.error(msg || "Failed to load quiz question.")
                navigate("/profile")
            }
        }
    }


    useEffect(() => {
        if (!userId) {
            toast.error("User not found.")
            navigate("/profile")
            return
        }
        fetchQuestion(currentIndex)
    }, [currentIndex, userId])

    useEffect(() => {
        if (timeLeft <= 0) return

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === 1) {
                    clearInterval(timer)
                    if (!isSubmitted) {
                        handleSubmit()
                    }
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft, isSubmitted])

    const handleSubmit = async () => {
        if (!question || isSubmitted) return

        try {
            console.log({
                "userId": userId,
                "questionId": question._id,
                "answer": selectedAnswer ?? "",
                "timeTaken": (question.timeWindow || 20) - timeLeft,
                "index": currentIndex
            })
            const res = await API.post("/api/user/quiz/attempt", {
                userId,
                questionId: question._id,
                answer: selectedAnswer ?? "",
                timeTaken: (question.timeWindow || 20) - timeLeft,
                index: currentIndex
            })


            toast.success("Answer submitted!")
            setShowAnswer(res.data.correctAnswer)
            setIsSubmitted(true)

        } catch (err) {
            console.error(err)
            toast.error(err.response?.data?.message || "Failed to submit answer.")
        }
    }

    // const handleNext = () => {
    //     setCurrentIndex((prev) => prev + 1) 
    // } 

    const handleNext = () => {
        if (currentIndex + 1 >= totalQuestions) {
            toast.success("You’ve completed today’s quiz!")
            navigate("/quiz/summary")
        } else {
            setCurrentIndex(prev => prev + 1)
        }
    }

    if (loading) return <p className="text-center mt-20">Loading quiz...</p>
    if (!question) return <p className="text-center mt-20">No question found.</p>

    return (
        <div className="max-w-2xl mx-auto mt-10 p-4 border rounded shadow">
            <div></div>
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
                            disabled={showAnswer !== null}
                        >
                            {opt}
                        </Button>
                    ))}
                </div>
            ) : (
                <textarea
                    className="w-full border p-2 mt-2 rounded bg-white text-gray-900 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    rows={4}
                    placeholder="Write your answer..."
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    value={selectedAnswer || ""}
                    disabled={showAnswer !== null}
                />
            )}

            {showAnswer !== null && (
                <div className="mt-4 p-3 border rounded bg-green-50 text-green-700 dark:bg-green-950/60 dark:text-green-300">
                    Correct Answer: <strong>
                        {question.type === "mcq"
                            ? (
                                question.options && question.options.length > Number(showAnswer)
                                    ? `${Number(showAnswer) + 1}. ${question.options[Number(showAnswer)]}`
                                    : Number(showAnswer) + 1
                            )
                            : showAnswer}
                    </strong>
                </div>
            )}

            <div className="mt-6 flex justify-between">
                <Button
                    variant="secondary"
                    onClick={handleSubmit}
                    disabled={isSubmitted}
                >
                    Submit
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={!isSubmitted}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
