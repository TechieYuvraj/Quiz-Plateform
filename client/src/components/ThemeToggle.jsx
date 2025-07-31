import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem("theme") === "dark" ||
            (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    return (
        <Button variant="outline" size="icon" onClick={toggleTheme}>
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
    );
}
