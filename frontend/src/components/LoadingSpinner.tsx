import { useTheme } from "../contexts/ThemeContext";

export const LoadingSpinner = () => {
    const { theme } = useTheme();

    return (
        <div
            className={`min-h-screen flex items-center justify-center ${
                theme === "dark" ? "bg-background" : "bg-background-light"
            }`}>
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p
                    className={`text-lg font-medium ${
                        theme === "dark" ? "text-text" : "text-text-light"
                    }`}>
                    Loading...
                </p>
            </div>
        </div>
    );
};
