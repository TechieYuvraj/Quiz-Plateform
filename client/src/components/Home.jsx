import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import logoIMG from "../assets/image.png";
import { useEffect, useState } from "react";
import API from "../../axios.config";


export default function Home() {
    const navigate = useNavigate();
    const [isCheck, setisCheck] = useState(false);

    useEffect(() => {
        const checkLogin = async () => {
            try {
                const res = await API.get("/api/user/check");
                if (res.data.success) {
                    navigate("/profile");
                } else {
                    setisCheck(true);
                }
            } catch (err) {
                setisCheck(true);
            }
        };

        checkLogin();
    }, [navigate]);

    if (!isCheck) return null;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 sm:px-6 bg-white dark:bg-zinc-900 transition-colors">
            <div className="mb-6">
                <img
                    src={logoIMG}
                    alt="Quiz Platform Logo"
                    className="mx-auto rounded-lg shadow-lg border-4 border-indigo-100 w-20 h-20 sm:w-48 sm:h-48 object-cover bg-white dark:bg-zinc-900"
                    style={{ backgroundColor: "#fff" }}
                />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-gray-900 dark:text-white">Welcome to Quiz Platform 🎓</h1>

            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-md sm:max-w-xl mb-6">
                Test your knowledge with daily quizzes, track your progress, and improve every day.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <Button
                    className="w-full sm:w-auto"
                    onClick={() => navigate("/register")}
                >
                    Get Started
                </Button>
                <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => navigate("/login")}
                >
                    Already have an account? Login
                </Button>
            </div>
        </div>
    );
}
