import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Check, Mail, MessageCircle, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNotifications } from "../contexts/NotificationContext";
import { useMessages, type Message } from "../hooks/useMessages";
import { NotificationModal } from "./NotificationModal";

interface NotificationsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationsPanel({
    isOpen,
    onClose,
}: NotificationsPanelProps) {
    const {
        messages,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refresh,
    } = useMessages();
    const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(
        null
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
    const panelRef = useRef<HTMLDivElement>(null);
    const { forceRefreshBadge } = useNotifications();

    useEffect(() => {
        if (isOpen) {
            refresh();
        }
    }, [isOpen, refresh]);

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

    useEffect(() => {
        if (activeTab === "all") {
            setFilteredMessages(messages);
        } else {
            setFilteredMessages(messages.filter((message) => !message.read));
        }
    }, [messages, activeTab]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleMessageClick = useCallback(
        async (message: Message) => {
            if (!message.read) {
                await markAsRead(message.id);
            }
            setSelectedMessage(message);
            setIsModalOpen(true);
        },
        [markAsRead]
    );

    const handleMarkAllAsRead = useCallback(async () => {
        const result = await markAllAsRead();
        if (result.success) {
            forceRefreshBadge();
        }
    }, [markAllAsRead, forceRefreshBadge]);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedMessage(null);
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "MMM d, yyyy h:mm a");
    };

    const handleTabChange = (tab: "all" | "unread") => {
        setActiveTab(tab);
        if (tab === "all") {
            refresh();
        } else {
            refresh();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="m-0">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 overflow-hidden">
                        <div className="absolute inset-0 overflow-hidden">
                            <div
                                className="absolute inset-0 bg-black/50 transition-opacity"
                                onClick={onClose}
                            />

                            <motion.div
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{
                                    type: "spring",
                                    damping: 25,
                                    stiffness: 200,
                                }}
                                className="fixed inset-y-0 right-0 sm:w-[350px] w-[250px] bg-surface shadow-xl">
                                <div className="h-full flex flex-col">
                                    <div className="px-4 py-4 border-b border-border">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="relative">
                                                    <Bell className="w-6 h-6 text-primary" />
                                                    {unreadCount > 0 && (
                                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-light text-xs font-medium rounded-full flex items-center justify-center">
                                                            {unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                                <h2 className="text-xl font-bold text-text">
                                                    Notifications
                                                </h2>
                                            </div>
                                            <button
                                                onClick={onClose}
                                                className="p-2 text-text-secondary hover:text-text transition-colors rounded-lg hover:bg-background-alt">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex space-x-1 mt-4 bg-background-alt p-1 rounded-lg">
                                            <button
                                                onClick={() =>
                                                    handleTabChange("all")
                                                }
                                                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                                    activeTab === "all"
                                                        ? "bg-surface text-text shadow-sm"
                                                        : "text-text-secondary hover:text-text"
                                                }`}>
                                                All
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleTabChange("unread")
                                                }
                                                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                                    activeTab === "unread"
                                                        ? "bg-surface text-text shadow-sm"
                                                        : "text-text-secondary hover:text-text"
                                                }`}>
                                                Unread{" "}
                                                {unreadCount > 0 &&
                                                    `(${unreadCount})`}
                                            </button>
                                        </div>

                                        {unreadCount > 0 && (
                                            <button
                                                onClick={handleMarkAllAsRead}
                                                className="flex items-center justify-center w-full mt-3 py-2 text-sm font-medium text-primary hover:bg-primary-light/30 transition-colors rounded-lg">
                                                <Check className="w-4 h-4 mr-1" />
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex-1 overflow-y-auto">
                                        {loading ? (
                                            <div className="flex justify-center items-center h-32">
                                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                            </div>
                                        ) : filteredMessages.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-64 text-text-secondary">
                                                {activeTab === "unread" ? (
                                                    <>
                                                        <Check className="w-12 h-12 mb-4" />
                                                        <p className="text-lg font-medium">
                                                            All caught up!
                                                        </p>
                                                        <p className="text-sm">
                                                            No unread
                                                            notifications
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Mail className="w-12 h-12 mb-4" />
                                                        <p className="text-lg font-medium">
                                                            No notifications yet
                                                        </p>
                                                        <p className="text-sm text-center px-2">
                                                            We'll notify you
                                                            when something
                                                            happens
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-border">
                                                {filteredMessages.map(
                                                    (message) => (
                                                        <div
                                                            key={message.id}
                                                            onClick={() =>
                                                                handleMessageClick(
                                                                    message
                                                                )
                                                            }
                                                            className={`p-4 hover:bg-background-alt transition-colors cursor-pointer ${
                                                                !message.read
                                                                    ? "bg-primary-light/10"
                                                                    : ""
                                                            }`}>
                                                            <div className="flex items-start space-x-3">
                                                                <div
                                                                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                                        !message.read
                                                                            ? "bg-primary-light text-primary"
                                                                            : "bg-background-alt text-text-secondary"
                                                                    }`}>
                                                                    <MessageCircle className="w-4 h-4" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex justify-between items-start mb-1">
                                                                        <span className="font-medium text-text truncate">
                                                                            {message
                                                                                .sender
                                                                                ?.username ||
                                                                                "Unknown User"}
                                                                        </span>
                                                                        <span className="text-xs text-text-secondary flex-shrink-0 ml-2">
                                                                            {formatDate(
                                                                                message.created_at
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm text-text-secondary mb-1 truncate">
                                                                        Re:{" "}
                                                                        {message
                                                                            .campaign
                                                                            ?.title ||
                                                                            "Campaign"}
                                                                    </p>
                                                                    <p className="text-sm font-medium text-text mb-1">
                                                                        {
                                                                            message.subject
                                                                        }
                                                                    </p>
                                                                    <p className="text-sm text-text-secondary line-clamp-2">
                                                                        {
                                                                            message.content
                                                                        }
                                                                    </p>
                                                                    {!message.read && (
                                                                        <div className="mt-2 flex items-center text-primary text-sm">
                                                                            <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                                                                            Click
                                                                            to
                                                                            view
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <NotificationModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                message={selectedMessage}
            />
        </div>
    );
}
