import { t } from "@lingui/core/macro";
import {
    Bell,
    FolderHeart,
    Globe,
    LogOut,
    Settings,
    User,
    Wallet,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../contexts/NotificationContext";
import { useAuth } from "../hooks/useAuth";
import { useMessages } from "../hooks/useMessages";
import { useWallet } from "../hooks/useWallet";
import { supabase } from "../lib/supabase";
import { profileEvents } from "../pages/Settings";
import { NotificationsPanel } from "./NotificationsPanel";

export function ProfileMenu() {
    const { user, signOut } = useAuth();
    const { unreadCount, refresh } = useMessages();
    const { lastRefreshed } = useNotifications();
    const { disconnectWallet } = useWallet();
    const [isOpen, setIsOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [username, setUsername] = useState<string>("");

    const isAdmin = user?.id === import.meta.env.VITE_ADMIN_USER_ID;

    useEffect(() => {
        if (user) {
            refresh();
            fetchUsername();
        }

        const handleFocus = () => {
            if (user) {
                refresh();
            }
        };

        window.addEventListener("focus", handleFocus);
        return () => {
            window.removeEventListener("focus", handleFocus);
        };
    }, [user, refresh]);

    useEffect(() => {
        if (user) {
            refresh();
        }
    }, [lastRefreshed, user, refresh]);

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

    const handleNotificationsPanelClose = () => {
        setIsNotificationsOpen(false);
        setTimeout(() => refresh(), 100);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        try {
            await disconnectWallet();
            await signOut();
            setIsOpen(false);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleMenuClick = () => {
        setIsOpen(false);
    };

    return (
        <>
            <div className="relative" ref={menuRef}>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => {
                            refresh();
                            setIsNotificationsOpen(true);
                        }}
                        className="p-2 rounded-lg hover:bg-background-alt transition-colors relative">
                        <Bell className="w-5 h-5 text-text-secondary" />
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-light text-xs font-medium rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center space-x-2 p-1 rounded-lg hover:bg-background-alt transition-colors pl-2 pr-4">
                        <div className="w-8 h-8 rounded-full text-text flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {username}
                        </span>
                    </button>
                </div>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg bg-surface shadow-2xl ring-1 ring-black ring-opacity-5">
                        <div className="py-1">
                            <Link
                                to="/my-campaigns"
                                onClick={handleMenuClick}
                                className="flex items-center px-4 py-2 text-sm text-text hover:bg-background-alt">
                                <FolderHeart className="w-4 h-4 mr-2" />
                                {t`My Campaigns`}
                            </Link>
                            <Link
                                to="/settings"
                                onClick={handleMenuClick}
                                className="flex items-center px-4 py-2 text-sm text-text hover:bg-background-alt">
                                <Settings className="w-4 h-4 mr-2" />
                                {t`Settings`}
                            </Link>
                            {isAdmin && (
                                <>
                                    <Link
                                        to="/admin/network-settings"
                                        onClick={handleMenuClick}
                                        className="flex items-center px-4 py-2 text-sm text-text hover:bg-background-alt">
                                        <Globe className="w-4 h-4 mr-2" />
                                        {t`Network`}
                                    </Link>
                                    <Link
                                        to="/admin/collect-fees"
                                        onClick={handleMenuClick}
                                        className="flex items-center px-4 py-2 text-sm text-text hover:bg-background-alt">
                                        <Wallet className="w-4 h-4 mr-2" />
                                        {t`Collect Fees`}
                                    </Link>
                                </>
                            )}
                            <button
                                onClick={handleSignOut}
                                className="flex items-center w-full px-4 py-2 text-sm text-text hover:bg-background-alt">
                                <LogOut className="w-4 h-4 mr-2" />
                                {t`Sign out`}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <NotificationsPanel
                isOpen={isNotificationsOpen}
                onClose={handleNotificationsPanelClose}
            />
        </>
    );
}
