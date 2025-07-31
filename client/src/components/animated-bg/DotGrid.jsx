import "./DotGrid.css";

export default function DotGrid() {
    return (
        <div className="dot-grid-background w-full h-full" aria-hidden="true">
            <div className="dot-grid-layer" />
        </div>
    );
}