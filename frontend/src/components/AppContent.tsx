import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { About } from "../pages/About";
import { ContractSettings } from "../pages/admin/ContractSettings";
import { EditFund } from "../pages/campaign/Edit";
import { NewFund } from "../pages/campaign/New";
import { CampaignDetails } from "../pages/CampaignDetails";
import { Campaigns } from "../pages/Campaigns";
import { Contact } from "../pages/Contact";
import { FAQs } from "../pages/FAQs";
import { Home } from "../pages/home/Home";
import { Login } from "../pages/Login";
import { MyCampaigns } from "../pages/MyCampaigns";
import { NotFound } from "../pages/NotFound";
import { Profile } from "../pages/Profile";
import { Register } from "../pages/Register";
import { Settings } from "../pages/Settings";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function AppContent() {
    const { theme } = useTheme();
    const location = useLocation();
    const isAuthPage = ["/login", "/register"].includes(location.pathname);
    const isFundPage = ["/campaign/new", "/campaign/edit"].some((path) =>
        location.pathname.startsWith(path)
    );
    const isAdminPage = location.pathname.startsWith("/admin");

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    return (
        <div className="min-h-screen bg-background transition-colors duration-200">
            {!isAuthPage && !isFundPage && !isAdminPage && <Navbar />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/campaign/new" element={<NewFund />} />
                <Route path="/campaign/edit/:id" element={<EditFund />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/my-campaigns" element={<MyCampaigns />} />
                <Route path="/campaign/:id" element={<CampaignDetails />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faqs" element={<FAQs />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route
                    path="/admin/contract-settings"
                    element={<ContractSettings />}
                />
                <Route path="*" element={<NotFound />} />
            </Routes>
            {!isAuthPage && !isFundPage && !isAdminPage && <Footer />}
        </div>
    );
}
