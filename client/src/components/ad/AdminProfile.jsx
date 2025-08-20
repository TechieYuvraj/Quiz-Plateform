import { useEffect, useState } from "react";
import API from "../../../axios.config";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginAdmin } from "@/redux/slices/adminSlice.js";
import { ThemeToggle } from "../ThemeToggle";

export default function AdminProfile() {
    const [admin, setAdmin] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await API.get("/api/admin/profile", { withCredentials: true });
                setAdmin(res.data);
                dispatch(loginAdmin(res.data));
            } catch (err) {
                toast.error(err.response?.data?.message || "Failed to fetch profile");
                // navigate("/admin/login");
                navigate(`/${import.meta.env.VITE_ADMIN_ROUTE_KEY}/login`)
            }
        };

        fetchProfile();
    }, [dispatch, navigate]);

    if (!admin) return <p className="text-center mt-20">Loading admin profile...</p>;

    return (
        <div className="relative max-w-lg mx-auto mt-10 p-6 border rounded shadow">
            <div className="absolute top-2 right-2">
                <ThemeToggle />
            </div>
            <h2 className="text-2xl font-bold mb-4">Admin Profile</h2>
            <p><strong>Name:</strong> {admin.name}</p>
            <p><strong>Email:</strong> {admin.email}</p>
            <p><strong>Role:</strong> {admin.role}</p>

            <div className="mt-6">
                <Button onClick={() => navigate(`/${import.meta.env.VITE_ADMIN_ROUTE_KEY}/dashboard`)} className="w-full">
                    Dashboard
                </Button>
            </div>
        </div >
    );
}
