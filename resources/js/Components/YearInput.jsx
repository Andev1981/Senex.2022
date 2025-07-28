import { useState, useEffect } from "react";

export default function YearInput({
    initialValue = "",
    onYearChange,
    ...props
}) {
    const [year, setYear] = useState(initialValue);
    const [error, setError] = useState("");
    const currentYear = new Date().getFullYear();

    // Update internal state if initialValue changes
    useEffect(() => {
        setYear(initialValue);
    }, [initialValue]);

    const handleChange = (e) => {
        const input = e.target.value.replace(/\D/g, "").slice(0, 4);
        setYear(input);
        setError("");
        if (onYearChange) onYearChange(input);
    };

    const validateYear = () => {
        if (!year) setError("Please enter a year");
        else if (year.length !== 4) setError("Year must be 4 digits");
        else if (year < 1900 || year > currentYear)
            setError(`Year must be between 1900 and ${currentYear}`);
        else setError("");
    };

    return (
        <div>
            <input
                {...props}
                value={year}
                onChange={handleChange}
                onBlur={validateYear}
                placeholder="YYYY"
                inputMode="numeric"
                className="border-primary/20 boder-[0.5] rounded-md shadow-sm focus:border-primary-light focus:ring-primary-light/20"
            />
            {error && <div style={{ color: "red" }}>{error}</div>}
        </div>
    );
}
