import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type Locale } from "../contexts/LanguageContext";
import { useLanguage } from "../hooks/useLanguage";

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const languages: { code: Locale; name: string; flag: string }[] = [
        { code: "en", name: "English", flag: "/flags/uk.svg" },
        { code: "ro", name: "Română", flag: "/flags/ro.svg" },
    ];

    const currentLanguage =
        languages.find((lang) => lang.code === language) || languages[0];

    const handleLanguageChange = (locale: Locale) => {
        setLanguage(locale);
        setIsOpen(false);
        window.location.reload();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-1 p-2 rounded-lg hover:bg-background-alt transition-colors"
                aria-label="Change language">
                <img
                    src={currentLanguage.flag}
                    alt={currentLanguage.name}
                    className="h-4 w-6 rounded-[3px]"
                />
                <ChevronDown className="w-4 h-4 text-text-secondary" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-surface rounded-lg shadow-lg overflow-hidden z-50 border border-border">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`flex items-center w-full px-4 py-2 text-sm ${
                                language === lang.code
                                    ? "bg-primary-light/20 text-primary"
                                    : "hover:bg-background-alt text-text"
                            }`}>
                            <img
                                src={lang.flag}
                                alt={lang.name}
                                className="h-4 w-6 mr-3 rounded-[3px]"
                            />
                            {lang.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
