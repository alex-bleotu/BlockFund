import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Message, useMessages } from "../hooks/useMessages";

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: Message | null;
}

export function NotificationModal({
    isOpen,
    onClose,
    message,
}: NotificationModalProps) {
    const [replyContent, setReplyContent] = useState("");
    const [isReplying, setIsReplying] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const { sendMessage, refresh } = useMessages();

    useEffect(() => {
        if (message) {
            refresh();

            return () => {
                refresh();
            };
        }
    }, [message, refresh]);

    if (!isOpen || !message) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleReply = async () => {
        if (!replyContent.trim() || !message) return;

        try {
            setIsSending(true);
            const result = await sendMessage(
                message.campaign_id,
                message.sender_id,
                `Re: ${message.subject}`,
                replyContent
            );

            if (result.success) {
                setReplyContent("");
                setIsReplying(false);
                refresh();
                onClose();
            }
        } catch (error) {
            console.error("Error sending reply:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleClose = () => {
        refresh();
        setTimeout(() => refresh(), 300);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
                <div
                    className="fixed inset-0 bg-black/50"
                    onClick={handleClose}></div>
                <div className="bg-surface rounded-xl shadow-xl w-full max-w-md z-10 relative">
                    <div className="flex justify-between items-center border-b border-border p-4">
                        <h2 className="text-xl font-bold text-text flex items-center">
                            <MessageCircle className="w-5 h-5 mr-2 text-primary" />
                            Message
                        </h2>
                        <button
                            onClick={handleClose}
                            className="text-text-secondary hover:text-text transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="mb-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="font-medium text-text">
                                        From:{" "}
                                        {message.sender?.username || "Unknown"}
                                    </div>
                                    <div className="text-sm text-text-secondary">
                                        {formatDate(message.created_at)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-text">
                                        Re:{" "}
                                        {message.campaign?.title || "Campaign"}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h3 className="font-bold text-text mb-2">
                                    {message.subject}
                                </h3>
                                <div className="bg-background-alt p-4 rounded-lg text-text-secondary whitespace-pre-wrap">
                                    {message.content}
                                </div>
                            </div>
                        </div>

                        {isReplying ? (
                            <div className="space-y-4">
                                <textarea
                                    value={replyContent}
                                    onChange={(e) =>
                                        setReplyContent(e.target.value)
                                    }
                                    placeholder="Type your reply..."
                                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text placeholder-text-secondary/60 transition-colors resize-none"
                                    rows={4}
                                />
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setIsReplying(false)}
                                        className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-background-alt transition-colors">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleReply}
                                        disabled={
                                            !replyContent.trim() || isSending
                                        }
                                        className="px-4 py-2 bg-primary text-light rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center">
                                        {isSending ? (
                                            "Sending..."
                                        ) : (
                                            <>
                                                Send
                                                <Send className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsReplying(true)}
                                className="w-full py-2 border-2 border-primary rounded-lg transition-colors text-primary hover:bg-primary hover:text-light flex items-center justify-center">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Reply
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
