import { t } from "@lingui/core/macro";
import { Send, User, X } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useMessages } from "../../hooks/useMessages";

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    creatorName: string;
    creatorId: string;
    campaignId: string | null;
}

export function ContactModal({
    isOpen,
    onClose,
    creatorName,
    creatorId,
    campaignId,
}: ContactModalProps) {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const { sendMessage } = useMessages();

    const SUBJECT_CHAR_LIMIT = 50;
    const MESSAGE_CHAR_LIMIT = 200;

    const subjectLength = useMemo(() => subject.length, [subject]);
    const messageLength = useMemo(() => message.length, [message]);

    const isSubjectAtLimit = subjectLength === SUBJECT_CHAR_LIMIT;
    const isAtLimit = messageLength === MESSAGE_CHAR_LIMIT;

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedSubject = subject.trim();
        const trimmedMessage = message.trim();

        if (!trimmedSubject || !trimmedMessage || !creatorId) return;

        try {
            setIsSending(true);
            const result = await sendMessage(
                campaignId,
                creatorId,
                trimmedSubject,
                trimmedMessage
            );

            if (result.success) {
                onClose();
                setSubject("");
                setMessage("");
                toast.success(t`Message sent successfully!`);
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
                <div
                    className="fixed inset-0 bg-black/50"
                    onClick={onClose}></div>
                <div className="bg-surface rounded-xl shadow-xl w-full max-w-md z-10 relative">
                    <div className="flex justify-between items-center border-b border-border p-4">
                        <h2 className="text-xl font-bold text-text flex items-center">
                            {t`Contact Creator`}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-text-secondary hover:text-text transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <div className="font-medium text-text">
                                    {creatorName}
                                </div>
                                <div className="text-sm text-text-secondary">
                                    {t`Campaign Creator`}
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-text">
                                    {t`Subject`}
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    required
                                    maxLength={SUBJECT_CHAR_LIMIT}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text"
                                    placeholder={t`Enter subject`}
                                />
                                <div className="flex justify-end">
                                    <span
                                        className={`text-xs ${
                                            isSubjectAtLimit
                                                ? "text-error"
                                                : subjectLength >
                                                  SUBJECT_CHAR_LIMIT * 0.8
                                                ? "text-warning"
                                                : "text-text-secondary"
                                        }`}>
                                        {subjectLength}/{SUBJECT_CHAR_LIMIT}{" "}
                                        {t`characters`}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-text">
                                    {t`Message`}
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                    rows={5}
                                    maxLength={MESSAGE_CHAR_LIMIT}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text resize-none break-words"
                                    style={{
                                        wordWrap: "break-word",
                                        overflowWrap: "break-word",
                                    }}
                                    placeholder={t`Type your message here...`}
                                />
                                <div className="flex justify-end">
                                    <span
                                        className={`text-xs ${
                                            isAtLimit
                                                ? "text-error"
                                                : messageLength >
                                                  MESSAGE_CHAR_LIMIT * 0.8
                                                ? "text-warning"
                                                : "text-text-secondary"
                                        }`}>
                                        {messageLength}/{MESSAGE_CHAR_LIMIT}{" "}
                                        {t`characters`}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={
                                        isSending ||
                                        !message.trim() ||
                                        !subject.trim()
                                    }
                                    className="px-4 py-2 bg-primary text-light rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center">
                                    {isSending ? (
                                        <span>{t`Sending...`}</span>
                                    ) : (
                                        <>
                                            <span>{t`Send Message`}</span>
                                            <Send className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
