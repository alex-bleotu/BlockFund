import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

export interface Message {
    id: string;
    campaign_id: string;
    sender_id: string;
    receiver_id: string;
    subject: string;
    content: string;
    read: boolean;
    created_at: string;
    campaign?: {
        title: string;
    };
    sender?: {
        username: string;
    };
}

export function useMessages() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchMessages();
        }
    }, [user]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("messages")
                .select(
                    `
          *,
          campaign:campaigns(title),
          sender:profiles!messages_sender_id_fkey(username)
        `
                )
                .eq("receiver_id", user?.id)
                .order("created_at", { ascending: false });

            if (error) throw error;

            setMessages(data || []);
            setUnreadCount(data?.filter((msg) => !msg.read).length || 0);
        } catch (err) {
            console.error("Error fetching messages:", err);
            setError("Failed to load messages");
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (
        campaignId: string,
        receiverId: string,
        subject: string,
        content: string
    ) => {
        try {
            const { error } = await supabase.from("messages").insert({
                campaign_id: campaignId,
                sender_id: user?.id,
                receiver_id: receiverId,
                subject,
                content,
            });

            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.error("Error sending message:", err);
            return { success: false, error: "Failed to send message" };
        }
    };

    const markAsRead = async (messageId: string) => {
        try {
            const { error } = await supabase
                .from("messages")
                .update({ read: true })
                .eq("id", messageId)
                .eq("receiver_id", user?.id);

            if (error) throw error;

            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === messageId ? { ...msg, read: true } : msg
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Error marking message as read:", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            if (!user || unreadCount === 0) return;

            // Get IDs of unread messages
            const unreadMessageIds = messages
                .filter((msg) => !msg.read)
                .map((msg) => msg.id);

            const { error } = await supabase
                .from("messages")
                .update({ read: true })
                .in("id", unreadMessageIds)
                .eq("receiver_id", user.id);

            if (error) throw error;

            // Update local state
            setMessages((prev) =>
                prev.map((msg) => (!msg.read ? { ...msg, read: true } : msg))
            );
            setUnreadCount(0);
        } catch (err) {
            console.error("Error marking all messages as read:", err);
        }
    };

    return {
        messages,
        unreadCount,
        loading,
        error,
        sendMessage,
        markAsRead,
        markAllAsRead,
        refresh: fetchMessages,
    };
}
