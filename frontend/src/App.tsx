import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router } from "react-router-dom";
import { AppContent } from "./components/AppContent";
import { MetaMaskStatus } from "./components/MetaMaskStatus";
import { ScrollToTop } from "./components/ScrollToTop";
import { AuthProvider } from "./contexts/AuthContext";
import LanguageProvider from "./contexts/LanguageContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ThemeProvider } from "./contexts/ThemeContext";

const routerConfig = {
    future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
    },
};

export default function App() {
    return (
        <Router {...routerConfig}>
            <LanguageProvider>
                <ThemeProvider>
                    <NotificationProvider>
                        <AuthProvider>
                            <div className="flex flex-col min-h-screen">
                                <AppContent />
                                <ScrollToTop />
                                <MetaMaskStatus />
                                <Toaster />
                            </div>
                        </AuthProvider>
                    </NotificationProvider>
                </ThemeProvider>
            </LanguageProvider>
        </Router>
    );
}
