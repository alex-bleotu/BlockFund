import { t } from "@lingui/core/macro";
import { MessageCircle, Send, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Message, useMessages } from "../../hooks/useMessages";

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
    const [isDeleting, setIsDeleting] = useState(false);
    const { sendMessage, refresh, deleteMessage } = useMessages();

    const REPLY_CHAR_LIMIT = 200;

    const replyLength = useMemo(() => replyContent.length, [replyContent]);
    const isAtLimit = replyLength === REPLY_CHAR_LIMIT;

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
        const trimmedContent = replyContent.trim();
        if (!trimmedContent || !message) return;

        try {
            setIsSending(true);
            const result = await sendMessage(
                message.campaign_id,
                message.sender_id,
                // t`Re:` + " " + message.subject,
                message.subject,
                trimmedContent
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

    const handleDelete = async () => {
        if (!message) return;

        try {
            setIsDeleting(true);
            const result = await deleteMessage(message.id);

            if (result.success) {
                toast.success(t`Message deleted`);
                refresh();
                onClose();
            } else {
                toast.error(result.error || t`Failed to delete message`);
            }
        } catch (error) {
            console.error("Error deleting message:", error);
            toast.error(t`An error occurred while deleting the message`);
        } finally {
            setIsDeleting(false);
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
                            {t`Message`}
                        </h2>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="text-text-secondary hover:text-error transition-colors">
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleClose}
                                className="text-text-secondary hover:text-text transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="mb-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="font-medium text-text">
                                        {t`From:`}{" "}
                                        {message.sender?.username || t`Unknown`}
                                    </div>
                                    <div className="text-sm text-text-secondary">
                                        {formatDate(message.created_at)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-text">
                                        {message.campaign?.title || t`Profile`}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h3 className="font-bold text-text mb-2 break-words whitespace-normal overflow-hidden">
                                    {message.subject}
                                </h3>
                                <div className="bg-background-alt p-4 rounded-lg text-text-secondary whitespace-pre-wrap break-words">
                                    {message.content}
                                </div>
                            </div>
                        </div>

                        {isReplying ? (
                            <div className="space-y-2">
                                <textarea
                                    value={replyContent}
                                    onChange={(e) =>
                                        setReplyContent(e.target.value)
                                    }
                                    placeholder={t`Type your reply...`}
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text placeholder-text-secondary/60 transition-colors resize-none break-words"
                                    rows={4}
                                    maxLength={REPLY_CHAR_LIMIT}
                                    style={{
                                        wordWrap: "break-word",
                                        overflowWrap: "break-word",
                                    }}
                                />
                                <div className="flex justify-between items-center">
                                    <span
                                        className={`text-xs ${
                                            isAtLimit
                                                ? "text-error"
                                                : replyLength >
                                                  REPLY_CHAR_LIMIT * 0.8
                                                ? "text-warning"
                                                : "text-text-secondary"
                                        }`}>
                                        {replyLength}/{REPLY_CHAR_LIMIT}{" "}
                                        {t`characters`}
                                    </span>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => setIsReplying(false)}
                                            className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-background-alt transition-colors">
                                            {t`Cancel`}
                                        </button>
                                        <button
                                            onClick={handleReply}
                                            disabled={
                                                !replyContent.trim() ||
                                                isSending
                                            }
                                            className="px-4 py-2 bg-primary text-light rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center">
                                            {isSending ? (
                                                t`Sending...`
                                            ) : (
                                                <>
                                                    {t`Send`}
                                                    <Send className="w-4 h-4 ml-2" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsReplying(true)}
                                className="w-full py-2 border-2 border-primary rounded-lg transition-colors text-primary hover:bg-primary hover:text-light flex items-center justify-center">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                {t`Reply`}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
