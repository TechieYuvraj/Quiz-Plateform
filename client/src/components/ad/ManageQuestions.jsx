import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import API from "../../../axios.config";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function ManageQuestions() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    // Filters
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterDate, setFilterDate] = useState("");

    const navigate = useNavigate();

    const fetchQuestions = async (pageNum = 1) => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page: pageNum,
                limit,
                ...(search && { search }),
                ...(filterType && { type: filterType }),
                ...(filterDate && { date: filterDate }),
            });

            const res = await API.get(`/api/admin/all-questions?${params.toString()}`, { withCredentials: true });

            setQuestions(res.data.questions || []);
            setTotalPages(res.data.totalPages || 1);
            setPage(pageNum);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to fetch questions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions(1);
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this question?")) return;
        try {
            const res = await API.delete(`/api/admin/delete-question/${id}`, { withCredentials: true });
            toast.success(res.data.message);
            fetchQuestions(page);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete question");
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                type: editing.type,
                text: editing.text,
                options: editing.type === "mcq" ? editing.options : undefined,
                correctAnswer: editing.correctAnswer,
                date: editing.date,
                timeWindow: editing.timeWindow || ""
            };
            const res = await API.put(`/api/admin/edit-question/${editing._id}`, payload, { withCredentials: true });
            toast.success(res.data.message);
            setEditing(null);
            fetchQuestions(page);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update question");
        }
    };

    if (loading) return <p className="text-center mt-10">Loading questions...</p>;

    return (
        <div className="max-w-5xl mx-auto mt-10 p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Manage Questions</h1>
                <Button variant="outline" onClick={() => navigate(`/${import.meta.env.VITE_ADMIN_ROUTE_KEY}/dashboard`)}>
                    &lt;
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <Input
                    placeholder="Search by question text..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1"
                />
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="">All Types</option>
                    <option value="mcq">MCQ</option>
                    <option value="descriptive">Descriptive</option>
                </select>
                <Input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                />
                <Button onClick={() => fetchQuestions(1)}>Apply</Button>
                <Button
                    variant="outline"
                    onClick={() => {
                        setSearch("");
                        setFilterType("");
                        setFilterDate("");
                        fetchQuestions(1);
                    }}
                >
                    Reset
                </Button>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
                {questions.length === 0 ? (
                    <p>No questions found.</p>
                ) : (
                    questions.map(q => (
                        <div key={q._id} className="border p-4 rounded shadow flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{q.text}</p>
                                <small className="text-gray-500">{q.type} | {q.date}</small>
                            </div>
                            <div className="space-x-2">
                                <Button size="sm" variant="secondary" onClick={() => setEditing(q)}>Edit</Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDelete(q._id)}>Delete</Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-6 gap-2">
                <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => fetchQuestions(page - 1)}
                >
                    Previous
                </Button>
                <span className="px-4 py-2 border rounded">
                    Page {page} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => fetchQuestions(page + 1)}
                >
                    Next
                </Button>
            </div>

            {/* Edit Modal */}
            {editing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">Edit Question</h2>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <Label>Question Type</Label>
                                <select
                                    value={editing.type}
                                    onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                                    className="border p-2 w-full rounded"
                                >
                                    <option value="mcq">MCQ</option>
                                    <option value="descriptive">Descriptive</option>
                                </select>
                            </div>

                            <div>
                                <Label>Question</Label>
                                <Textarea
                                    value={editing.text}
                                    onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                                />
                            </div>

                            {editing.type === "mcq" && (
                                <>
                                    {Object.keys(editing.options || {}).map((key, index) => (
                                        <div key={index}>
                                            <Label>Option {key}</Label>
                                            <Input
                                                value={editing.options[key]}
                                                onChange={(e) => setEditing({
                                                    ...editing,
                                                    options: { ...editing.options, [key]: e.target.value }
                                                })}
                                            />
                                        </div>
                                    ))}
                                    <div>
                                        <Label>Correct Answer</Label>
                                        <select
                                            value={editing.correctAnswer}
                                            onChange={(e) => setEditing({ ...editing, correctAnswer: Number(e.target.value) })}
                                            className="border p-2 w-full rounded"
                                        >
                                            {Object.keys(editing.options || {}).map((key, index) => (
                                                <option key={index} value={index}>
                                                    {key}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            {editing.type === "descriptive" && (
                                <div>
                                    <Label>Reference Answer (Optional)</Label>
                                    <Textarea
                                        value={editing.correctAnswer}
                                        onChange={(e) => setEditing({ ...editing, correctAnswer: e.target.value })}
                                    />
                                </div>
                            )}

                            <div>
                                <Label>Date</Label>
                                <Input
                                    type="date"
                                    value={editing.date}
                                    onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label>Time Window</Label>
                                <Input
                                    value={editing.timeWindow || ""}
                                    onChange={(e) => setEditing({ ...editing, timeWindow: e.target.value })}
                                    placeholder="Optional"
                                />
                            </div>

                            <div className="flex justify-between">
                                <Button type="submit">Save</Button>
                                <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}