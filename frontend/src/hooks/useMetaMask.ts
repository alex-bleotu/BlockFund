import { t } from "@lingui/core/macro";
import { useEffect, useState } from "react";
import { useWallet } from "./useWallet";

declare global {
    interface Window {
        ethereum?: any;
    }
}

export type MetaMaskStatus = {
    isInstalled: boolean;
    isConnected: boolean;
    isLocked: boolean;
    error: string | null;
    connect: () => Promise<void>;
};

export function useMetaMask(): MetaMaskStatus {
    const { connectWallet } = useWallet();
    const [isInstalled, setIsInstalled] = useState<boolean>(false);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isLocked, setIsLocked] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const checkLockStatus = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({
                    method: "eth_accounts",
                });
                setIsLocked(accounts.length === 0);
            } catch (err) {
                setIsLocked(true);
            }
        }
    };

    useEffect(() => {
        const checkMetaMask = async () => {
            if (typeof window.ethereum !== "undefined") {
                setIsInstalled(true);
                await checkLockStatus();
            } else {
                setIsInstalled(false);
            }
        };

        checkMetaMask();

        if (window.ethereum) {
            window.ethereum.on(
                "accountsChanged",
                async (accounts: string[]) => {
                    setIsConnected(accounts.length > 0);
                    await checkLockStatus();
                }
            );

            window.ethereum.on(
                "unlockStateChanged",
                async (isUnlocked: boolean) => {
                    setIsLocked(!isUnlocked);
                    await checkLockStatus();
                }
            );
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener("accountsChanged", () => {});
                window.ethereum.removeListener("unlockStateChanged", () => {});
            }
        };
    }, []);

    const connect = async () => {
        if (!window.ethereum) {
            setError(t`MetaMask is not installed`);
            return;
        }

        try {
            if (!localStorage.getItem("walletAddress")) {
                await connectWallet();

                if (localStorage.getItem("walletAddress")) {
                    setIsConnected(true);
                    setIsLocked(false);
                    setError(null);
                    window.location.reload();
                }
            } else {
                setIsConnected(true);
                setIsLocked(false);
                setError(null);
            }
        } catch (err: any) {
            setError(err.message || t`Failed to connect to MetaMask`);
        }
    };

    return {
        isInstalled,
        isConnected,
        isLocked,
        error,
        connect,
    };
}
