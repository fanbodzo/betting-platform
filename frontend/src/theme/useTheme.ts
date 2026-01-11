import { useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "theme";

function applyTheme(mode: ThemeMode) {
    document.documentElement.setAttribute("data-theme", mode);
}

export function useTheme() {
    const [theme, setTheme] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved === "dark" ? "dark" : "light";
    });

    useEffect(() => {
        applyTheme(theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

    return { theme, setTheme, toggle };
}
