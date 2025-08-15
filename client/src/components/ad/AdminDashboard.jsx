import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import API from "../../../axios.config";
import { toast } from "sonner";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        todaysQuizzes: 0,
        totalUsers: 0,
        pendingReviews: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await API.get("/api/admin/dashboard-stats", { withCredentials: true });
                console.log(res.data.todaysQuizzes)
                setStats({
                    todaysQuizzes: res.data.todaysQuizzes || 0,
                    totalUsers: res.data.totalUsers || 0,
                    pendingReviews: res.data.pendingReviews || 0
                });
            } catch (err) {
                toast.error(err.response?.data?.message || "Failed to load dashboard stats");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <p className="text-center mt-10">Loading dashboard...</p>;
    }

    return (
        <div className="max-w-5xl mx-auto mt-10 p-6">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="border rounded p-4 shadow text-center">
                    <h2 className="text-xl font-semibold">Today's Quizzes</h2>
                    <p className="text-2xl font-bold mt-2">{stats.todaysQuizzes}</p>
                </div>
                <div className="border rounded p-4 shadow text-center">
                    <h2 className="text-xl font-semibold">Total Users</h2>
                    <p className="text-2xl font-bold mt-2">{stats.totalUsers}</p>
                </div>
                <div className="border rounded p-4 shadow text-center">
                    <h2 className="text-xl font-semibold">Pending Reviews</h2>
                    <p className="text-2xl font-bold mt-2">{stats.pendingReviews}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-4">
                <Button onClick={() => navigate("/admin/create-quiz")}>
                    Create Quiz
                </Button>
                <Button variant="secondary" onClick={() => navigate("/admin/manage-questions")}>
                    Manage Questions
                </Button>
                <Button variant="outline" onClick={() => navigate("/admin/results")}>
                    View Results
                </Button>
            </div>
        </div>
    );
}
