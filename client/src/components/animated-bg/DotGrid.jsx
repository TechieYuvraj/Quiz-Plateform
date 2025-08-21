import { useMemo } from "react";
import "./DotGrid.css";

export default function DotGrid() {
    // generate random particles once
    const dots = useMemo(() => {
        return Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100, // position %
            y: Math.random() * 100,
            dx: (Math.random() - 0.5) * 200, // move in random direction up to ±200px
            dy: (Math.random() - 0.5) * 200,
            duration: 5 + Math.random() * 10 // between 5s and 15s
        }));
    }, []);

    return (
        <div className="dot-grid-background">
            {dots.map((dot) => (
                <div
                    key={dot.id}
                    className="dot"
                    style={{
                        left: `${dot.x}%`,
                        top: `${dot.y}%`,
                        animationDuration: `${dot.duration}s`,
                        // 👇 IMPORTANT: custom properties must be quoted keys
                        "--dx": `${dot.dx}px`,
                        "--dy": `${dot.dy}px`
                    }}
                />
            ))}
        </div>
    );
}
