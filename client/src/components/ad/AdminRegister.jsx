import { useState } from "react";
import API from "../../../axios.config"; // Adjust path as needed
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminRegister() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "moderator",
        secretKey: "",
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // If role is superadmin, ensure secret key is filled
        if (form.role === "superadmin" && !form.secretKey.trim()) {
            toast.error("Secret key is required for Superadmin registration.");
            return;
        }

        setLoading(true);
        try {
            const res = await API.post("/api/admin/registerAdmin", form, { withCredentials: true });
            toast.success(res.data.message || "Admin registered successfully!");
            console.log("Regoistered admin")
            // navigate("/admin/profile");
            navigate(`/${import.meta.env.VITE_ADMIN_ROUTE_KEY}/profile`);
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
            <h2 className="text-2xl font-bold mb-6">Register Admin</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" value={form.name} onChange={handleChange} required />
                </div>

                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
                </div>

                <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
                </div>

                <div>
                    <Label htmlFor="role">Role</Label>
                    <select
                        id="role"
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="border p-2 w-full rounded"
                    >
                        <option value="moderator">Moderator</option>
                        <option value="superadmin">Super Admin</option>
                    </select>
                </div>

                {form.role === "superadmin" && (
                    <div>
                        <Label htmlFor="secretKey">Secret Key</Label>
                        <Input
                            id="secretKey"
                            name="secretKey"
                            type="password"
                            value={form.secretKey}
                            onChange={handleChange}
                            required={form.role === "superadmin"}
                        />
                    </div>
                )}

                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Registering..." : "Register"}
                </Button>
            </form>
        </div>
    );
}
