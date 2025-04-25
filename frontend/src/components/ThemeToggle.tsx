import { t } from "@lingui/core/macro";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-background-alt transition-colors text-text"
            aria-label={t`Toggle theme`}>
            {theme === "light" ? (
                <Moon className="w-5 h-5" />
            ) : (
                <Sun className="w-5 h-5" />
            )}
        </button>
    );
}
