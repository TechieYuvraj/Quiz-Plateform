import { useState } from "react";
import API from "../../../axios.config"; // Adjust path as needed
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLogin() {
    const [form, setForm] = useState({
        identifier: "", // can be email or username
        password: "",
        rememberMe: false,
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.identifier.trim() || !form.password.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const res = await API.post(
                "/api/admin/loginAdmin",
                form,
                { withCredentials: true }
            );
            toast.success(res.data.message || "Login successful!");
            navigate("/admin/profile");
        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
            <h2 className="text-2xl font-bold mb-6">Admin Login</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="identifier">Email or Username</Label>
                    <Input
                        id="identifier"
                        name="identifier"
                        value={form.identifier}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="rememberMe"
                        name="rememberMe"
                        checked={form.rememberMe}
                        onChange={handleChange}
                        className="w-4 h-4"
                    />
                    <Label htmlFor="rememberMe">Remember Me</Label>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Logging in..." : "Login"}
                </Button>
            </form>
        </div>
    );
}
