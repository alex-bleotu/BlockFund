import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

const NOTIFICATION_POLLING_INTERVAL = 60000;

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
    const [refreshCounter, setRefreshCounter] = useState(0);
    const [lastChecked, setLastChecked] = useState<number>(Date.now());

    const refresh = useCallback(() => {
        setRefreshCounter((prev) => prev + 1);
        setLastChecked(Date.now());
    }, []);

    useEffect(() => {
        if (!user) return;

        fetchMessages();

        const intervalId = setInterval(() => {
            if (Date.now() - lastChecked > 30000) {
                fetchMessages();
                setLastChecked(Date.now());
            }
        }, NOTIFICATION_POLLING_INTERVAL);

        return () => {
            clearInterval(intervalId);
        };
    }, [user, lastChecked]);

    useEffect(() => {
        if (!user) return;

        const subscription = supabase
            .channel("public:messages")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `receiver_id=eq.${user.id}`,
                },
                () => {
                    if (Date.now() - lastChecked > 5000) {
                        fetchMessages();
                        setLastChecked(Date.now());
                    }
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [user, lastChecked]);

    useEffect(() => {
        if (user) {
            fetchMessages();
        }
    }, [refreshCounter, user]);

    const fetchMessages = async () => {
        if (!user) return;

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
                .eq("receiver_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;

            setMessages(data || []);

            const { count, error: countError } = await supabase
                .from("messages")
                .select("*", { count: "exact", head: true })
                .eq("receiver_id", user.id)
                .eq("read", false);

            if (countError) throw countError;

            setUnreadCount(count || 0);
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
        if (!user) return;

        try {
            const { error } = await supabase
                .from("messages")
                .update({ read: true })
                .eq("id", messageId)
                .eq("receiver_id", user.id);

            if (error) throw error;

            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === messageId ? { ...msg, read: true } : msg
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));

            setTimeout(() => refresh(), 300);

            return { success: true };
        } catch (err) {
            console.error("Error marking message as read:", err);
            return { success: false };
        }
    };

    const markAllAsRead = async () => {
        if (!user || unreadCount === 0) return { success: false };

        try {
            const unreadMessageIds = messages
                .filter((msg) => !msg.read)
                .map((msg) => msg.id);

            if (unreadMessageIds.length === 0) return { success: true };

            const { error } = await supabase
                .from("messages")
                .update({ read: true })
                .in("id", unreadMessageIds)
                .eq("receiver_id", user.id);

            if (error) throw error;

            setMessages((prev) =>
                prev.map((msg) => (!msg.read ? { ...msg, read: true } : msg))
            );
            setUnreadCount(0);
            setLastChecked(Date.now());

            setTimeout(() => refresh(), 300);

            return { success: true };
        } catch (err) {
            console.error("Error marking all messages as read:", err);
            return { success: false };
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
        refresh,
    };
}
