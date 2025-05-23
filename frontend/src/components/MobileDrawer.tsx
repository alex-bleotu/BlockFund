import { t } from "@lingui/core/macro";
import {
    Bell,
    Compass,
    FolderHeart,
    Globe,
    HelpCircle,
    LogOut,
    Mail,
    Menu,
    Moon,
    Rocket,
    Settings,
    Sun,
    User,
    Wallet,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../hooks/useAuth";
import { useMessages } from "../hooks/useMessages";
import { useWallet } from "../hooks/useWallet";
import { supabase } from "../lib/supabase";
import { profileEvents } from "../pages/Settings";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NotificationsPanel } from "./NotificationsPanel";

export function MobileDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const { user, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { unreadCount } = useMessages();
    const { disconnectWallet } = useWallet();
    const location = useLocation();
    const [username, setUsername] = useState<string>("");

    const isAdmin = user?.id === import.meta.env.VITE_ADMIN_USER_ID;

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (user) {
            fetchUsername();
        }
    }, [user]);

    useEffect(() => {
        const unsubscribe = profileEvents.subscribe(() => {
            if (user) {
                fetchUsername();
            }
        });

        return () => {
            unsubscribe();
        };
    }, [user]);

    const fetchUsername = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("username")
                .eq("id", user.id)
                .single();

            if (error) throw error;
            if (data && data.username) {
                setUsername(data.username);
            } else {
                setUsername(user.email?.split("@")[0] || "");
            }
        } catch (err) {
            console.error("Error fetching username:", err);
            setUsername(user.email?.split("@")[0] || "");
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const drawer = document.getElementById("mobile-drawer");
            const menuButton = document.getElementById("mobile-menu-button");

            if (
                drawer &&
                !drawer.contains(event.target as Node) &&
                menuButton &&
                !menuButton.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const handleSignOut = async () => {
        try {
            await disconnectWallet();
            await signOut();
            setIsOpen(false);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleLinkClick = () => {
        setIsOpen(false);
    };

    return (
        <div className="md:hidden">
            <button
                id="mobile-menu-button"
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-background transition-colors"
                aria-label={t`Menu`}>
                <Menu className="w-6 h-6 text-text" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" />
            )}

            <div
                id="mobile-drawer"
                className={`fixed top-0 right-0 w-[250px] h-full bg-surface shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}>
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-border">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-lg hover:bg-background-alt transition-colors">
                                    {theme === "light" ? (
                                        <Moon className="w-5 h-5 text-text" />
                                    ) : (
                                        <Sun className="w-5 h-5 text-text" />
                                    )}
                                </button>
                                <LanguageSwitcher />
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-lg hover:bg-background-alt transition-colors"
                                aria-label={t`Close menu`}>
                                <X className="w-6 h-6 text-text" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {user ? (
                            <>
                                <div className="px-4 py-4 border-b border-border">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                                            <User className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-text">
                                                {username}
                                            </div>
                                            <div className="text-sm text-text-secondary">
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <nav className="p-4 space-y-2">
                                    <Link
                                        to="/explore"
                                        onClick={handleLinkClick}
                                        className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors ${
                                            location.pathname === "/explore"
                                                ? "bg-primary-light text-primary"
                                                : "text-text-secondary hover:bg-background-alt"
                                        }`}>
                                        <Compass className="w-5 h-5 mr-3" />
                                        {t`Explore`}
                                    </Link>

                                    <Link
                                        to="/my-campaigns"
                                        onClick={handleLinkClick}
                                        className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors ${
                                            location.pathname ===
                                            "/my-campaigns"
                                                ? "bg-primary-light text-primary"
                                                : "text-text-secondary hover:bg-background-alt"
                                        }`}>
                                        <FolderHeart className="w-5 h-5 mr-3" />
                                        {t`My Campaigns`}
                                    </Link>

                                    <button
                                        onClick={() => {
                                            setIsNotificationsOpen(true);
                                            setIsOpen(false);
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-text-secondary hover:bg-background-alt rounded-lg transition-colors relative">
                                        <Bell className="w-5 h-5 mr-3" />
                                        {t`Notifications`}
                                        {unreadCount > 0 && (
                                            <span className="absolute top-2 left-8 w-4 h-4 bg-primary text-light text-xs font-medium rounded-full flex items-center justify-center">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    <Link
                                        to="/settings"
                                        onClick={handleLinkClick}
                                        className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors ${
                                            location.pathname === "/settings"
                                                ? "bg-primary-light text-primary"
                                                : "text-text-secondary hover:bg-background-alt"
                                        }`}>
                                        <Settings className="w-5 h-5 mr-3" />
                                        {t`Settings`}
                                    </Link>

                                    {isAdmin && (
                                        <>
                                            <Link
                                                to="/admin/network-settings"
                                                onClick={handleLinkClick}
                                                className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors ${
                                                    location.pathname ===
                                                    "/admin/network-settings"
                                                        ? "bg-primary-light text-primary"
                                                        : "text-text-secondary hover:bg-background-alt"
                                                }`}>
                                                <Globe className="w-5 h-5 mr-3" />
                                                {t`Network`}
                                            </Link>
                                            <Link
                                                to="/admin/collect-fees"
                                                onClick={handleLinkClick}
                                                className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors ${
                                                    location.pathname ===
                                                    "/admin/collect-fees"
                                                        ? "bg-primary-light text-primary"
                                                        : "text-text-secondary hover:bg-background-alt"
                                                }`}>
                                                <Wallet className="w-5 h-5 mr-3" />
                                                {t`Collect Fees`}
                                            </Link>
                                        </>
                                    )}
                                </nav>

                                <div className="p-4 border-t border-border">
                                    <div className="space-y-2">
                                        <Link
                                            to="/about"
                                            onClick={handleLinkClick}
                                            className="flex items-center w-full px-4 py-2 text-text-secondary hover:bg-background-alt rounded-lg transition-colors">
                                            <HelpCircle className="w-5 h-5 mr-3" />
                                            {t`About`}
                                        </Link>
                                        <Link
                                            to="/faqs"
                                            onClick={handleLinkClick}
                                            className="flex items-center w-full px-4 py-2 text-text-secondary hover:bg-background-alt rounded-lg transition-colors">
                                            <HelpCircle className="w-5 h-5 mr-3" />
                                            {t`FAQs`}
                                        </Link>
                                        <Link
                                            to="/contact"
                                            onClick={handleLinkClick}
                                            className="flex items-center w-full px-4 py-2 text-text-secondary hover:bg-background-alt rounded-lg transition-colors">
                                            <Mail className="w-5 h-5 mr-3" />
                                            {t`Contact`}
                                        </Link>
                                    </div>
                                </div>

                                <div className="p-4 space-y-3">
                                    <Link
                                        to="/campaign/new"
                                        onClick={handleLinkClick}
                                        className="flex items-center w-full px-4 py-2 text-light bg-primary hover:bg-primary-dark rounded-lg transition-colors justify-center">
                                        <Rocket className="w-5 h-5 mr-2" />
                                        {t`Start a Campaign`}
                                    </Link>

                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center w-full px-4 py-2 text-text-secondary hover:bg-background-alt rounded-lg transition-colors">
                                        <LogOut className="w-5 h-5 mr-3" />
                                        {t`Sign out`}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="p-4 space-y-3">
                                <Link
                                    to="/login"
                                    onClick={handleLinkClick}
                                    className="flex items-center w-full px-4 py-2 text-light bg-primary hover:bg-primary-dark rounded-lg transition-colors">
                                    {t`Login`}
                                </Link>

                                <div className="space-y-2">
                                    <Link
                                        to="/about"
                                        onClick={handleLinkClick}
                                        className="flex items-center w-full px-4 py-2 text-text-secondary hover:bg-background-alt rounded-lg transition-colors">
                                        <HelpCircle className="w-5 h-5 mr-3" />
                                        {t`About`}
                                    </Link>
                                    <Link
                                        to="/faqs"
                                        onClick={handleLinkClick}
                                        className="flex items-center w-full px-4 py-2 text-text-secondary hover:bg-background-alt rounded-lg transition-colors">
                                        <HelpCircle className="w-5 h-5 mr-3" />
                                        {t`FAQs`}
                                    </Link>
                                    <Link
                                        to="/contact"
                                        onClick={handleLinkClick}
                                        className="flex items-center w-full px-4 py-2 text-text-secondary hover:bg-background-alt rounded-lg transition-colors">
                                        <Mail className="w-5 h-5 mr-3" />
                                        {t`Contact`}
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <NotificationsPanel
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
            />
        </div>
    );
}
