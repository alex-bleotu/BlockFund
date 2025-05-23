import { t } from "@lingui/core/macro";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

export function ContractSettings() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [contractAddress, setContractAddress] = useState("");
    const [network, setNetwork] = useState<"local" | "sepolia" | "mainnet">(
        "sepolia"
    );
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthChecking, setIsAuthChecking] = useState(true);

    useEffect(() => {
        if (!user) {
            toast.error(t`Access denied`);
            navigate("/");
            return;
        }

        setIsAuthChecking(false);

        if (user.id !== import.meta.env.VITE_ADMIN_USER_ID) {
            toast.error(t`Access denied`);
            navigate("/");
        }
    }, [user, navigate]);

    useEffect(() => {
        const savedAddress = localStorage.getItem("CONTRACT_ADDRESS_LOCAL");
        const savedNetwork = localStorage.getItem("NETWORK") || "sepolia";

        if (savedAddress) {
            setContractAddress(savedAddress);
        }
        setNetwork(savedNetwork as "local" | "sepolia" | "mainnet");
    }, []);

    const handleSave = async () => {
        try {
            setIsLoading(true);

            if (
                contractAddress &&
                !/^0x[a-fA-F0-9]{40}$/.test(contractAddress)
            ) {
                toast.error(t`Invalid Ethereum contract address`);
                return;
            }

            localStorage.setItem("CONTRACT_ADDRESS_LOCAL", contractAddress);
            localStorage.setItem("NETWORK", network);

            if (network !== "local") {
                const { error } = await supabase
                    .from("config")
                    .update({ value: network })
                    .eq("key", "network");

                if (error) {
                    console.error("Error updating network in database:", error);
                    toast.error(t`Failed to update network in database`);
                    return;
                }
            }

            if (network === "local") {
                toast.success(
                    t`Local network settings saved for this device only.`
                );
            } else {
                toast.success(t`Network settings saved for all users.`);
            }
        } catch (error) {
            console.error("Error saving contract settings:", error);
            toast.error(t`Failed to save settings`);
        } finally {
            setIsLoading(false);
        }
    };

    if (isAuthChecking) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-background pt-24 pb-16">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center text-text-secondary hover:text-text mb-8 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    {t`Back`}
                </button>

                <div className="bg-surface rounded-xl p-6 shadow-lg">
                    <h1 className="text-2xl font-bold text-text mb-6">
                        {t`Contract Settings`}
                    </h1>

                    <div className="space-y-6">
                        <div>
                            <label
                                htmlFor="contract-address"
                                className="block text-sm font-medium text-text mb-2">
                                {t`Local Contract Address`}
                            </label>
                            <input
                                type="text"
                                id="contract-address"
                                value={contractAddress}
                                onChange={(e) =>
                                    setContractAddress(e.target.value)
                                }
                                disabled={network !== "local" || isLoading}
                                placeholder="0x000..."
                                className={`w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text ${
                                    network !== "local"
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                            />
                            <p className="text-xs text-text-secondary mt-1">
                                {network === "local"
                                    ? t`The Ethereum address of your locally deployed contract.`
                                    : t`Contract address input is only available when using Local network.`}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text mb-3">
                                {t`Network`}
                            </label>
                            <div className="flex items-center space-x-3">
                                <button
                                    type="button"
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                        network === "local"
                                            ? "bg-primary text-light"
                                            : "bg-background-alt text-text-secondary hover:bg-primary/10"
                                    }`}
                                    onClick={() => setNetwork("local")}>
                                    {t`Local`}
                                </button>
                                <button
                                    type="button"
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                        network === "sepolia"
                                            ? "bg-primary text-light"
                                            : "bg-background-alt text-text-secondary hover:bg-primary/10"
                                    }`}
                                    onClick={() => setNetwork("sepolia")}>
                                    {t`Sepolia`}
                                </button>
                                <button
                                    type="button"
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                        network === "mainnet"
                                            ? "bg-primary text-light"
                                            : "bg-background-alt text-text-secondary hover:bg-primary/10"
                                    }`}
                                    onClick={() => setNetwork("mainnet")}>
                                    {t`Mainnet`}
                                </button>
                            </div>
                            <p className="text-xs text-text-secondary mt-2">
                                {network === "local"
                                    ? t`Local network settings are stored only on this device.`
                                    : t`Sepolia and Mainnet settings are applied globally for all users.`}
                            </p>
                        </div>

                        <div className="p-4 bg-primary-light rounded-lg text-sm text-text-secondary border border-primary/20">
                            <p className="font-medium text-primary mb-1">{t`Important Note`}</p>
                            <p>
                                {network === "local"
                                    ? t`Local network settings are for development and testing purposes on this device only. Changes will be applied after page refresh.`
                                    : network === "sepolia"
                                    ? t`Sepolia Test Network`
                                    : t`Ethereum Mainnet`}{" "}
                                {t`settings will be applied globally for all users. This affects where campaigns are deployed and how users interact with the blockchain.`}
                            </p>
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="flex items-center px-4 py-2 bg-primary text-light rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-light border-t-transparent rounded-full animate-spin mr-2" />
                                ) : (
                                    <Save className="w-5 h-5 mr-2" />
                                )}
                                {t`Save Settings`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
