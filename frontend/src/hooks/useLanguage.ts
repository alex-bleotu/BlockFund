import { useContext } from "react";
import { LanguageContext, type Locale } from "../contexts/LanguageContext";

export function useLanguage() {
    const context = useContext(LanguageContext);

    if (context === null || context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }

    return {
        language: context.language as Locale,
        setLanguage: context.setLanguage as (locale: Locale) => void,
    };
}
