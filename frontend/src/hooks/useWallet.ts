import { t } from "@lingui/core/macro";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

export function useWallet() {
    const { user } = useAuth();
    const [address, setAddress] = useState<string | null>(() =>
        localStorage.getItem("walletAddress")
    );
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const loadWallet = async () => {
            setLoading(true);
            if (!user) {
                setAddress(null);
                localStorage.removeItem("walletAddress");
                setLoading(false);
                return;
            }
            try {
                const { data, error: fetchErr } = await supabase
                    .from("profiles")
                    .select("wallet_address")
                    .eq("id", user.id)
                    .single();
                if (fetchErr) throw fetchErr;
                const walletAddress = data?.wallet_address || null;
                if (isMounted) {
                    setAddress(walletAddress);
                    if (walletAddress) {
                        localStorage.setItem("walletAddress", walletAddress);
                    } else {
                        localStorage.removeItem("walletAddress");
                    }
                }
            } catch (err) {
                console.error("Error loading wallet address:", err);
                if (isMounted) setError(t`Failed to load wallet`);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadWallet();
        return () => {
            isMounted = false;
        };
    }, [user]);

    const connectWallet = useCallback(async () => {
        if (!user || localStorage.getItem("walletAddress")) return;
        setError(null);
        setLoading(true);

        try {
            if (!(window as any).ethereum) {
                throw new Error(t`MetaMask is not installed`);
            }

            const [newAddress] = (await (window as any).ethereum.request({
                method: "eth_requestAccounts",
            })) as string[];

            if (!newAddress) {
                throw new Error(t`No account found`);
            }

            const { data, error: updateErr } = await supabase
                .from("profiles")
                .update({ wallet_address: newAddress })
                .eq("id", user.id)
                .select();

            if (updateErr) throw updateErr;
            if (!data || data.length === 0) {
                throw new Error(
                    "Failed to update wallet_address — check RLS policies"
                );
            }

            setAddress(newAddress);
            localStorage.setItem("walletAddress", newAddress);

            toast.success(t`Wallet connected successfully!`);
        } catch (err: any) {
            console.error("Error connecting wallet:", err);
            const msg =
                err.code === -32002
                    ? t`Connection already in progress. Please check MetaMask.`
                    : err.message?.toLowerCase().includes("user rejected")
                    ? t`MetaMask connection was rejected`
                    : err.message || t`Failed to connect wallet`;
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const disconnectWallet = useCallback(async () => {
        if (!localStorage.getItem("walletAddress")) return;

        setError(null);
        setLoading(true);

        try {
            if (user?.id) {
                const { error: updateErr } = await supabase
                    .from("profiles")
                    .update({ wallet_address: null })
                    .eq("id", user.id)
                    .select();
                if (updateErr) throw updateErr;
                localStorage.removeItem("walletAddress");
            }
            setAddress(null);
            localStorage.removeItem("walletAddress");

            if (
                (window as any).ethereum?.request &&
                typeof (window as any).ethereum.request === "function"
            ) {
                try {
                    await (window as any).ethereum.request({
                        method: "wallet_revokePermissions",
                        params: [{ eth_accounts: {} }],
                    });
                } catch (revokeErr: any) {
                    console.warn("Could not revoke permissions:", revokeErr);
                }
            }

            toast.success(t`Wallet disconnected successfully`);
        } catch (err: any) {
            console.error("Error disconnecting wallet:", err);
            const msg = err.message || t`Failed to disconnect wallet`;
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [user]);

    return { address, loading, error, connectWallet, disconnectWallet };
}
