import { ethers } from "ethers";
import { useEffect, useState } from "react";

type WalletStatus = "not-installed" | "locked" | "ready" | "error";

export function MetaMaskStatus() {
    const [status, setStatus] = useState<WalletStatus>("not-installed");
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        checkMetaMaskStatus();
        const interval = setInterval(checkMetaMaskStatus, 10000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Reset visibility whenever status changes
        setIsVisible(true);

        // If status is ready, hide after 5 seconds
        if (status === "ready") {
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [status]);

    const getStatusConfig = (status: WalletStatus) => {
        switch (status) {
            case "not-installed":
                return {
                    message:
                        "MetaMask is not installed. Please install it to use this app.",
                    icon: "🦊",
                    className: "bg-red-600",
                };
            case "locked":
                return {
                    message: "MetaMask is locked. Please unlock your wallet.",
                    icon: "🔒",
                    className: "bg-red-600",
                };
            case "ready":
                return {
                    message: "MetaMask is ready to use",
                    icon: "✅",
                    className: "bg-gray-600",
                };
            case "error":
                return {
                    message:
                        "Error connecting to MetaMask. Please check your wallet.",
                    icon: "⚠️",
                    className: "bg-red-500",
                };
        }
    };

    const checkMetaMaskStatus = async () => {
        let newStatus: WalletStatus;

        if (typeof window.ethereum === "undefined") {
            newStatus = "not-installed";
        } else {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.listAccounts();

                if (accounts.length === 0) {
                    newStatus = "locked";
                } else {
                    newStatus = "ready";
                }
            } catch (error) {
                newStatus = "error";
            }
        }

        if (newStatus !== status) {
            setStatus(newStatus);
        }
    };

    const config = getStatusConfig(status);

    if (!isVisible) return null;

    return (
        <div
            className={`hidden sm:flex fixed bottom-4 right-4 z-50 items-center rounded-full cursor-pointer group p-0.5 ${config.className}`}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center">
                <span className="text-xl">{config.icon}</span>
            </div>
            <div className="overflow-hidden max-w-0 group-hover:max-w-sm transition-all duration-500 ease-in-out">
                <span className="whitespace-nowrap text-white text-sm ml-1 mr-4 font-semibold">
                    {config.message}
                </span>
            </div>
        </div>
    );
}
