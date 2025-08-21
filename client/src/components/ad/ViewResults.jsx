import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import API from "../../../axios.config";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function ViewResults() {
    const [date, setDate] = useState("");
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;
    const navigate = useNavigate();

    const [viewingAnswers, setViewingAnswers] = useState(null); // { name, answers: [] }
    const [loadingAnswers, setLoadingAnswers] = useState(false);
    const selectedUserIdRef = useRef(null); // Add this line

    const fetchResults = async (pageNum = 1) => {
        if (!date) {
            toast.error("Please select a date");
            return;
        }

        try {
            setLoading(true);
            // console.log(`Fetching results for date: ${date}, search: ${search}, page: ${pageNum}`);
            const res = await API.get(
                `/api/admin/results?date=${date}&search=${search}&page=${pageNum}&limit=${limit}`,
                { withCredentials: true }
            );
            // console.log(res.data)
            setResults(res.data.results || []);
            setPage(res.data.currentPage || 1);
            setTotalPages(res.data.totalPages || 1);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to fetch results");
        } finally {
            setLoading(false);
        }
    };

    const fetchAnswers = async (userId, name) => {
        try {
            selectedUserIdRef.current = userId; // Store userId for later use
            setLoadingAnswers(true);
            const res = await API.get(
                `/api/admin/view-answers?date=${date}&userId=${userId}`,
                { withCredentials: true }
            );
            setViewingAnswers({
                name,
                answers: res.data.answers || []
            });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to fetch answers");
        } finally {
            setLoadingAnswers(false);
        }
    };

    useEffect(() => {
        if (date) fetchResults(page);
    }, [date]);

    return (
        <div className="max-w-6xl mx-auto mt-10 p-6">
            <h1 className="text-3xl font-bold mb-6">
                <Button variant="outline" onClick={() => navigate(`/${import.meta.env.VITE_ADMIN_ROUTE_KEY}/dashboard`)} className="mr-2">
                    &lt;
                </Button>
                View Results
            </h1>


            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <div className="flex flex-col">
                    <Label>Quiz Date</Label>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="flex flex-col flex-1">
                    <Label>Search by Name</Label>
                    <Input
                        placeholder="Enter student name"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-end">
                    <Button onClick={() => fetchResults(1)}>Search</Button>
                </div>
            </div>

            {/* Results Table */}
            {loading ? (
                <p className="text-center">Loading results...</p>
            ) : results.length === 0 ? (
                <p>No results found for this date.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border">
                        <thead>
                            <tr className="">
                                <th className="p-2 border">Name</th>
                                <th className="p-2 border">Score</th>
                                <th className="p-2 border">Percentage</th>
                                <th className="p-2 border">Rank</th>
                                <th className="p-2 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((r) => (
                                <tr key={r.userId}>
                                    <td className="p-2 border">{r.name}</td>
                                    <td className="p-2 border">{r.score}</td>
                                    <td className="p-2 border">{r.percentage}%</td>
                                    <td className="p-2 border">{r.rank}</td>
                                    <td className="p-2 border">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => fetchAnswers(r.userId, r.name)}
                                        >
                                            View Answers
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center mt-6 gap-2">
                <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => fetchResults(page - 1)}
                >
                    Previous
                </Button>
                <span className="px-4 py-2 border rounded">
                    Page {page} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => fetchResults(page + 1)}
                >
                    Next
                </Button>
            </div>

            {/* View Answers Modal */}
            {viewingAnswers && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded shadow-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto border dark:border-zinc-700 transition-colors">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                            Answers - {viewingAnswers.name}
                        </h2>

                        {loadingAnswers ? (
                            <p className="text-center text-gray-700 dark:text-gray-200">Loading answers...</p>
                        ) : viewingAnswers.answers.length === 0 ? (
                            <p className="text-center text-gray-700 dark:text-gray-200">No answers found.</p>
                        ) : (
                            viewingAnswers.answers.map((a, idx) => {
                                // Status color classes
                                let status = a.type === "mcq"
                                    ? (Number(a.userAnswer) === Number(a.correctAnswer) ? "r" : "w")
                                    : a.isCorrect || "p";
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
                                const correctAnswerClass = a.type === "mcq"
                                    ? "text-green-700 dark:text-green-300 font-semibold"
                                    : "text-gray-600 dark:text-gray-300 font-semibold";

                                return (
                                    <div key={idx} className={`border p-3 rounded mb-3 transition-colors ${statusClasses}`}>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            Q{idx + 1}: {a.questionText}
                                        </p>
                                        {a.type === "mcq" && (
                                            <>
                                                <p>
                                                    <strong className="text-gray-800 dark:text-gray-200">Your Answer:</strong>{" "}
                                                    <span className={answerTextClass}>
                                                        {a.options?.[a.userAnswer] ?? "No answer"}
                                                    </span>
                                                </p>
                                                <p>
                                                    <strong className="text-gray-800 dark:text-gray-200">Correct Answer:</strong>{" "}
                                                    <span className={correctAnswerClass}>
                                                        {a.options?.[a.correctAnswer] ?? "N/A"}
                                                    </span>
                                                </p>
                                                <p>
                                                    <strong className="text-gray-800 dark:text-gray-200">Status:</strong>{" "}
                                                    {Number(a.userAnswer) === Number(a.correctAnswer)
                                                        ? <span className="text-green-700 dark:text-green-300">✅ Correct</span>
                                                        : <span className="text-red-700 dark:text-red-300">❌ Wrong</span>}
                                                </p>
                                            </>
                                        )}
                                        {a.type === "descriptive" && (
                                            <>
                                                <p>
                                                    <strong className="text-gray-800 dark:text-gray-200">User Answer:</strong>{" "}
                                                    <span className={answerTextClass}>{a.userAnswer || "No answer"}</span>
                                                </p>
                                                <p>
                                                    <strong className="text-gray-800 dark:text-gray-200">Reference Answer:</strong>{" "}
                                                    <span className={correctAnswerClass}>{a.correctAnswer || "N/A"}</span>
                                                </p>
                                                {/* Status display */}
                                                <p className="mt-2">
                                                    <strong className="text-gray-800 dark:text-gray-200">Status:</strong>{" "}
                                                    {a.isCorrect === "r"
                                                        ? <span className="text-green-700 dark:text-green-300">✅ Correct</span>
                                                        : a.isCorrect === "w"
                                                            ? <span className="text-red-700 dark:text-red-300">❌ Wrong</span>
                                                            : <span className="text-yellow-700 dark:text-yellow-300">⏳ Pending</span>}
                                                </p>
                                                {/* Action buttons */}
                                                <div className="flex gap-2 mt-2">
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={async () => {
                                                            try {
                                                                await API.put(
                                                                    "/api/admin/mark-descriptive",
                                                                    {
                                                                        userId: selectedUserIdRef.current,
                                                                        questionId: a.questionId,
                                                                        status: "r",
                                                                    },
                                                                    { withCredentials: true }
                                                                );
                                                                toast.success("Marked Correct");
                                                                setViewingAnswers((prev) => ({
                                                                    ...prev,
                                                                    answers: prev.answers.map((ans) =>
                                                                        ans.questionId === a.questionId
                                                                            ? { ...ans, isCorrect: "r" }
                                                                            : ans
                                                                    ),
                                                                }));
                                                            } catch (err) {
                                                                toast.error(
                                                                    err.response?.data?.message || "Failed to mark"
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        Mark Correct
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={async () => {
                                                            try {
                                                                await API.put(
                                                                    "/api/admin/mark-descriptive",
                                                                    {
                                                                        userId: selectedUserIdRef.current,
                                                                        questionId: a.questionId,
                                                                        status: "w",
                                                                    },
                                                                    { withCredentials: true }
                                                                );
                                                                toast.error("Marked Wrong");
                                                                setViewingAnswers((prev) => ({
                                                                    ...prev,
                                                                    answers: prev.answers.map((ans) =>
                                                                        ans.questionId === a.questionId
                                                                            ? { ...ans, isCorrect: "w" }
                                                                            : ans
                                                                    ),
                                                                }));
                                                            } catch (err) {
                                                                toast.error(
                                                                    err.response?.data?.message || "Failed to mark"
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        Mark Wrong
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })
                        )}

                        <div className="mt-4 flex justify-end">
                            <Button variant="outline" onClick={() => setViewingAnswers(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
