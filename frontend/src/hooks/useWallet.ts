import { ethers } from "ethers";
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
                if (isMounted) setError("Failed to load wallet");
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
        if (!user) return;
        setError(null);
        setLoading(true);

        try {
            if (!window.ethereum) {
                throw new Error("MetaMask is not installed");
            }

            const provider = new ethers.BrowserProvider(window.ethereum);

            let accounts = await provider.listAccounts();
            if (accounts.length === 0) {
                accounts = await provider.send("eth_requestAccounts", []);
            }

            const newAddress = accounts[0].address;
            if (!newAddress) {
                throw new Error("No account found");
            }

            const { error: updateErr } = await supabase
                .from("profiles")
                .update({ wallet_address: newAddress })
                .eq("id", user.id);
            if (updateErr) throw updateErr;

            setAddress(newAddress);
            localStorage.setItem("walletAddress", newAddress);
            toast.success("Wallet connected successfully!");
        } catch (err: any) {
            console.error("Error connecting wallet:", err);
            const msg =
                err.code === -32002
                    ? "Connection already in progress. Please check MetaMask."
                    : err.message?.toLowerCase().includes("user rejected")
                    ? "MetaMask connection was rejected"
                    : err.message || "Failed to connect wallet";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const disconnectWallet = useCallback(async () => {
        setError(null);
        setLoading(true);

        try {
            if (user?.id) {
                const { error: updateErr } = await supabase
                    .from("profiles")
                    .update({ wallet_address: null })
                    .eq("id", user.id);
                if (updateErr) throw updateErr;
            }

            setAddress(null);
            localStorage.removeItem("walletAddress");
            toast.success("Wallet disconnected successfully");
        } catch (err: any) {
            console.error("Error disconnecting wallet:", err);
            const msg = err.message || "Failed to disconnect wallet";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [user]);

    return { address, loading, error, connectWallet, disconnectWallet };
}
