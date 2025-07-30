import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import API from "../../../axios.config";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "@/redux/slices/authSlice";
import { logout } from "@/redux/slices/authSlice";
import { Button } from "@/components/ui/button";

import { ThemeToggle } from "../ThemeToggle";



export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navi = useNavigate()
    const dispatch = useDispatch();

    const fetchProfile = async () => {
        try {
            const res = await API.get("/api/user/profile");
            console.log(res.data.user)
            dispatch(login(res.data.user))
            setUser(res.data.user);
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to fetch profile");
            dispatch(logout())
            setTimeout(() => {
                navi("/login")
            }, 3000);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading...</span>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">User not found or not logged in</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center px-4">
            <div className="absolute top-2 right-2">
                <ThemeToggle />
            </div>
            <Card className="w-full max-w-md shadow-lg">
                <CardContent className="p-6 space-y-4">
                    <h2 className="text-xl font-bold text-center">Welcome, {user.name}</h2>
                    <p><b>Email:</b> {user.email}</p>
                    <p><b>Phone:</b> {user.phone}</p>
                    <p><b>College:</b> {user.college}</p>
                    <p><b>Course:</b> {user.course}</p>
                    <p><b>Year:</b> {user.year}</p>
                    <Button onClick={() => { navi("/quiz") }} className="bg-green-500 text-black">Start Quiz</Button>
                </CardContent>
            </Card>
        </div>
    );
}
