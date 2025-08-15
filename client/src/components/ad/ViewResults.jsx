import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import API from "../../../axios.config";
import { toast } from "sonner";

export default function ViewResults() {
    const [date, setDate] = useState("");
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    const [viewingAnswers, setViewingAnswers] = useState(null); // { name, answers: [] }
    const [loadingAnswers, setLoadingAnswers] = useState(false);

    const fetchResults = async (pageNum = 1) => {
        if (!date) {
            toast.error("Please select a date");
            return;
        }

        try {
            setLoading(true);
            console.log(`Fetching results for date: ${date}, search: ${search}, page: ${pageNum}`);
            const res = await API.get(
                `/api/admin/results?date=${date}&search=${search}&page=${pageNum}&limit=${limit}`,
                { withCredentials: true }
            );
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
            <h1 className="text-3xl font-bold mb-6">View Results</h1>

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
                            <tr className="bg-gray-100">
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            Answers - {viewingAnswers.name}
                        </h2>

                        {loadingAnswers ? (
                            <p>Loading answers...</p>
                        ) : viewingAnswers.answers.length === 0 ? (
                            <p>No answers found.</p>
                        ) : (
                            viewingAnswers.answers.map((a, idx) => (
                                <div key={idx} className="border p-3 rounded mb-3">
                                    <p className="font-semibold">
                                        Q{idx + 1}: {a.questionText}
                                    </p>
                                    {a.type === "mcq" && (
                                        <>
                                            <p>
                                                <strong>Your Answer:</strong>{" "}
                                                {a.options?.[a.userAnswer]}
                                            </p>
                                            <p>
                                                <strong>Correct Answer:</strong>{" "}
                                                {a.options?.[a.correctAnswer]}
                                            </p>
                                            <p>
                                                <strong>Status:</strong>{" "}
                                                {a.isCorrect === "r" ? "✅ Correct" : "❌ Wrong"}
                                            </p>
                                        </>
                                    )}
                                    {a.type === "descriptive" && (
                                        <>
                                            <p>
                                                <strong>Your Answer:</strong> {a.userAnswer}
                                            </p>
                                            <div className="flex gap-2 mt-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => toast.success("Marked Correct")}
                                                >
                                                    Mark Correct
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => toast.error("Marked Wrong")}
                                                >
                                                    Mark Wrong
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
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
