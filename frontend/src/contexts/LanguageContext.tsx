import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { createContext, useEffect, useState } from "react";

export const LanguageContext = createContext<{
    language: Locale;
    setLanguage: (l: Locale) => void;
} | null>(null);

export type Locale = "en" | "ro";

async function dynamicActivate(locale: Locale) {
    let messages;
    switch (locale) {
        case "en":
            ({ messages } = await import("../locales/en/messages.po"));
            break;
        case "ro":
            ({ messages } = await import("../locales/ro/messages.po"));
            break;
        default:
            throw new Error(`Unsupported locale: ${locale}`);
    }
    i18n.load(locale, messages);
    i18n.activate(locale);
}

export const LanguageProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [language, setLanguage] = useState<Locale>(() => {
        return (localStorage.getItem("language") as Locale) || "ro";
    });
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setReady(false);
        (async () => {
            try {
                await dynamicActivate(language);
            } catch (err) {
                console.error("i18n activation failed:", err);
            } finally {
                setReady(true);
            }
        })();
        localStorage.setItem("language", language);
    }, [language]);

    if (!ready) {
        return <div>Loading translations…</div>;
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            <I18nProvider i18n={i18n}>{children}</I18nProvider>
        </LanguageContext.Provider>
    );
};

export { i18n };
export default LanguageProvider;
