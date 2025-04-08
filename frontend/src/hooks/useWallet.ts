import { ethers } from "ethers";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

export function useWallet() {
    const [address, setAddress] = useState<string | null>(() => {
        return localStorage.getItem("walletAddress");
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            loadWalletAddress();
        } else {
            setAddress(null);
            localStorage.removeItem("walletAddress");
        }
    }, [user]);

    const loadWalletAddress = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("wallet_address")
                .eq("id", user.id)
                .single();

            if (error) throw error;

            const walletAddress = data?.wallet_address || null;
            setAddress(walletAddress);

            if (walletAddress) {
                localStorage.setItem("walletAddress", walletAddress);
            } else {
                localStorage.removeItem("walletAddress");
            }
        } catch (err) {
            console.error("Error loading wallet address:", err);
        } finally {
            setLoading(false);
        }
    };

    const connectWallet = async () => {
        if (!user) return;

        try {
            setError(null);
            setLoading(true);

            if (!window.ethereum) {
                const message = "MetaMask is not installed";
                toast.error(message);
                throw new Error(message);
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const newAddress = accounts[0];

            const { error: updateError } = await supabase
                .from("profiles")
                .update({ wallet_address: newAddress })
                .eq("id", user.id);

            if (updateError) throw updateError;

            setAddress(newAddress);
            localStorage.setItem("walletAddress", newAddress);
            toast.success("Wallet connected successfully!");
        } catch (err: any) {
            console.error("Error connecting wallet:", err);
            const errorMessage = err.message
                ?.toLowerCase()
                .includes("user rejected")
                ? "MetaMask connection was rejected"
                : err.message || "Failed to connect wallet";

            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const disconnectWallet = async () => {
        try {
            setError(null);
            setLoading(true);

            if (user?.id) {
                const { error: updateError } = await supabase
                    .from("profiles")
                    .update({ wallet_address: null })
                    .eq("id", user.id);

                if (updateError) throw updateError;
            }

            setAddress(null);
            localStorage.removeItem("walletAddress");
            toast.success("Wallet disconnected successfully");
        } catch (err: any) {
            console.error("Error disconnecting wallet:", err);
            const errorMessage = err.message || "Failed to disconnect wallet";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return {
        address,
        loading,
        error,
        connectWallet,
        disconnectWallet,
    };
}
