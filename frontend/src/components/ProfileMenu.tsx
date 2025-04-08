import { Bell, FolderHeart, LogOut, Settings, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useMessages } from "../hooks/useMessages";
import { NotificationsPanel } from "./NotificationsPanel";

export function ProfileMenu() {
    const { user, signOut } = useAuth();
    const { unreadCount } = useMessages();
    const [isOpen, setIsOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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
                        onClick={() => setIsNotificationsOpen(true)}
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
                            {user?.email?.split("@")[0]}
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
                                My Campaigns
                            </Link>
                            <Link
                                to="/settings"
                                onClick={handleMenuClick}
                                className="flex items-center px-4 py-2 text-sm text-text hover:bg-background-alt">
                                <Settings className="w-4 h-4 mr-2" />
                                Settings
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center w-full px-4 py-2 text-sm text-text hover:bg-background-alt">
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign out
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <NotificationsPanel
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
            />
        </>
    );
}
