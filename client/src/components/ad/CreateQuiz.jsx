import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../axios.config";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CreateQuiz() {
    const navigate = useNavigate();

    const indianDate = new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'Asia/Kolkata'
    }).format(new Date());

    const [form, setForm] = useState({
        type: "mcq",
        text: "",
        options: ["", ""], // minimum 2 options
        correctAnswer: "",
        date: indianDate,
        timeWindow: 60, // default in seconds or minutes (as per backend)
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...form.options];
        newOptions[index] = value;
        setForm({ ...form, options: newOptions });
    };

    const addOption = () => {
        setForm({ ...form, options: [...form.options, ""] });
    };

    const removeOption = (index) => {
        if (form.options.length > 2) {
            setForm({
                ...form,
                options: form.options.filter((_, i) => i !== index),
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.text.trim()) {
            toast.error("Question text is required");
            return;
        }

        if (form.type === "mcq") {
            if (form.options.length < 2) {
                toast.error("MCQ must have at least 2 options");
                return;
            }
            if (form.correctAnswer === "") {
                toast.error("Please select a correct answer");
                return;
            }
        }

        try {
            setLoading(true);

            const payload = {
                type: form.type,
                text: form.text,
                options: form.type === "mcq" ? form.options : undefined,
                correctAnswer:
                    form.type === "mcq"
                        ? parseInt(form.correctAnswer)
                        : form.type === "descriptive"
                            ? form.correctAnswer?.trim() || null
                            : undefined,
                date: form.date,
                timeWindow: Number(form.timeWindow),
            };

            console.log(payload);

            const res = await API.post("/api/admin/add-question", payload, {
                withCredentials: true,
            });

            toast.success(res.data.message || "Quiz question added successfully!");

            setForm({
                type: "mcq",
                text: "",
                options: ["", ""],
                correctAnswer: "",
                date: new Date().toISOString().slice(0, 10),
                timeWindow: 60,
            });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add quiz question");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 border rounded shadow">
            <h2 className="text-2xl font-bold mb-6">Create New Quiz</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="type">Question Type</Label>
                    <select
                        id="type"
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        className="border p-2 w-full rounded"
                    >
                        <option value="mcq">MCQ</option>
                        <option value="descriptive">Descriptive</option>
                    </select>
                </div>

                <div>
                    <Label htmlFor="text">Question</Label>
                    <Textarea
                        id="text"
                        name="text"
                        value={form.text}
                        onChange={handleChange}
                        required
                    />
                </div>

                {form.type === "mcq" && (
                    <>
                        {form.options.map((opt, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="flex-1">
                                    <Label htmlFor={`option-${index}`}>
                                        Option {String.fromCharCode(65 + index)}
                                    </Label>
                                    <Input
                                        id={`option-${index}`}
                                        value={opt}
                                        onChange={(e) =>
                                            handleOptionChange(index, e.target.value)
                                        }
                                        required={index < 2}
                                    />
                                </div>
                                {form.options.length > 2 && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => removeOption(index)}
                                        className="mt-5"
                                    >
                                        ❌
                                    </Button>
                                )}
                            </div>
                        ))}

                        <Button
                            type="button"
                            onClick={addOption}
                            variant="outline"
                            className="mt-2"
                        >
                            + Add Option
                        </Button>

                        <div>
                            <Label htmlFor="correctAnswer">Correct Answer</Label>
                            <select
                                id="correctAnswer"
                                name="correctAnswer"
                                value={form.correctAnswer}
                                onChange={handleChange}
                                className="border p-2 w-full rounded"
                                required
                            >
                                <option value="">Select Correct Option</option>
                                {form.options.map((_, index) => (
                                    <option key={index} value={index}>
                                        {String.fromCharCode(65 + index)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                )}

                {form.type === "descriptive" && (
                    <div>
                        <Label htmlFor="correctAnswer">
                            Reference Answer (Optional)
                        </Label>
                        <Textarea
                            id="correctAnswer"
                            name="correctAnswer"
                            value={form.correctAnswer}
                            onChange={handleChange}
                        />
                    </div>
                )}

                <div>
                    <Label htmlFor="date">Quiz Date</Label>
                    <Input
                        id="date"
                        name="date"
                        type="date"
                        value={form.date}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="timeWindow">Time Window (in seconds)</Label>
                    <Input
                        id="timeWindow"
                        name="timeWindow"
                        type="number"
                        value={form.timeWindow}
                        onChange={handleChange}
                        required
                        min={10}
                    />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Saving..." : "Create Quiz"}
                </Button>
            </form>

            <div className="mt-4">
                <Button variant="outline" onClick={() => navigate(`/${import.meta.env.VITE_ADMIN_ROUTE_KEY}/dashboard`)}>
                    Back to Dashboard
                </Button>
            </div>
        </div>
    );
}
