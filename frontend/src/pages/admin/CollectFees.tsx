import { t } from "@lingui/core/macro";
import { ArrowLeft, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";
import { useCampaignContract } from "../../hooks/useCampaignContract";
import { supabase } from "../../lib/supabase";

const SEPOLIA_CONTRACT_ADDRESS = import.meta.env
    .VITE_SEPOLIA_CONTRACT_ADDRESS as string;
const MAINNET_CONTRACT_ADDRESS = import.meta.env
    .VITE_MAINNET_CONTRACT_ADDRESS as string;

interface CampaignInfo {
    title: string;
    onchain_id: number;
    raised: string;
}

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function CollectFees() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        collectFees,
        loading: contractLoading,
        getFeeReceiver,
    } = useCampaignContract();
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [campaignId, setCampaignId] = useState<string>("");
    const [network, setNetwork] = useState<"local" | "sepolia" | "mainnet">(
        "sepolia"
    );
    const [contractAddress, setContractAddress] = useState("");
    const [campaignInfo, setCampaignInfo] = useState<CampaignInfo | null>(null);
    const [withdrawalFee, setWithdrawalFee] = useState(0);
    const [isFetching, setIsFetching] = useState(false);
    const [feeReceiver, setFeeReceiver] = useState<string>("");

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
        const feePercentage =
            Number(localStorage.getItem("WITHDRAWAL_FEE")) || 0;

        if (savedAddress) {
            setContractAddress(savedAddress);
        }
        setNetwork(savedNetwork as "local" | "sepolia" | "mainnet");
        setWithdrawalFee(feePercentage / 100);
    }, []);

    useEffect(() => {
        const fetchFeeReceiver = async () => {
            try {
                const receiver = await getFeeReceiver();
                setFeeReceiver(receiver);
            } catch (error) {
                console.error("Error fetching fee receiver:", error);
                setFeeReceiver("");
            }
        };

        fetchFeeReceiver();
    }, [campaignId]);

    useEffect(() => {
        const fetchCampaignIfValid = async () => {
            if (!campaignId || !UUID_REGEX.test(campaignId)) {
                setCampaignInfo(null);
                return;
            }

            setIsFetching(true);
            try {
                const campaign = await fetchCampaignInfo(campaignId);
                if (campaign) {
                    setCampaignInfo(campaign);
                } else {
                    setCampaignInfo(null);
                }
            } catch (error) {
                console.error("Error fetching campaign:", error);
                setCampaignInfo(null);
            } finally {
                setIsFetching(false);
            }
        };

        const debounceTimer = setTimeout(fetchCampaignIfValid, 500);
        return () => clearTimeout(debounceTimer);
    }, [campaignId]);

    const fetchCampaignInfo = async (id: string) => {
        try {
            const { data, error } = await supabase
                .from("campaigns")
                .select("title, onchain_id, raised")
                .eq("id", id)
                .single();

            if (error) throw error;
            if (!data) {
                toast.error(t`Campaign not found`);
                return null;
            }
            if (!data.onchain_id) {
                toast.error(t`Campaign is not deployed on blockchain`);
                return null;
            }

            return {
                title: data.title,
                onchain_id: data.onchain_id,
                raised: data.raised,
            };
        } catch (error) {
            console.error("Error fetching campaign:", error);
            toast.error(t`Failed to fetch campaign information`);
            return null;
        }
    };

    const calculateFees = (totalFunded: string) => {
        const amount = parseFloat(totalFunded);
        if (isNaN(amount)) return "0";
        const fees = amount * withdrawalFee;
        return fees.toFixed(4);
    };

    const handleCollectFees = async () => {
        if (!campaignId) {
            toast.error(t`Please enter a campaign ID`);
            return;
        }

        if (!campaignInfo) {
            toast.error(t`Please enter a valid campaign ID`);
            return;
        }

        try {
            setIsLoading(true);

            if (network === "local" && !contractAddress) {
                toast.error(t`Local contract address not configured`);
                return;
            }

            if (network === "sepolia" && !SEPOLIA_CONTRACT_ADDRESS) {
                toast.error(t`Sepolia contract address not configured`);
                return;
            }

            if (network === "mainnet" && !MAINNET_CONTRACT_ADDRESS) {
                toast.error(t`Mainnet contract address not configured`);
                return;
            }

            await collectFees(campaignInfo.onchain_id);
            toast.success(t`Fees collected successfully!`);
        } catch (error: any) {
            console.error("Error collecting fees:", error);
            if (
                error.message.includes(
                    "Campaign must be closed to collect fees"
                )
            )
                toast.error(t`Campaign is not closed`);
            else if (error.message.includes("No fees to collect"))
                toast.error(t`No fees to collect`);
            else toast.error(t`Failed to collect fees`);
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
                        {t`Collect Campaign Fees`}
                    </h1>

                    <div className="space-y-6">
                        <div>
                            <label
                                htmlFor="campaign-id"
                                className="block text-sm font-medium text-text mb-2">
                                {t`Campaign ID`}
                            </label>
                            <input
                                type="text"
                                id="campaign-id"
                                value={campaignId}
                                onChange={(e) => setCampaignId(e.target.value)}
                                disabled={isLoading}
                                placeholder="Enter campaign ID"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text"
                            />
                        </div>

                        {isFetching && (
                            <div className="flex justify-center">
                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}

                        {campaignInfo && (
                            <div className="p-4 bg-primary-light rounded-lg text-sm text-text-secondary border border-primary/20">
                                <p className="font-medium text-primary mb-1">{t`Campaign Information`}</p>
                                <p>
                                    {t`Title`}: {campaignInfo.title}
                                </p>
                                <p>
                                    {t`On-chain ID`}: {campaignInfo.onchain_id}
                                </p>
                                <p>
                                    {t`Total Raised`}: {campaignInfo.raised} ETH
                                </p>
                                <p>
                                    {t`Withdrawal Fee`}:{" "}
                                    {(withdrawalFee * 100).toFixed(2)}%
                                </p>
                                <p className="font-medium text-primary mt-2">
                                    {t`Fees to Collect`}:{" "}
                                    {calculateFees(campaignInfo.raised)} ETH
                                </p>
                            </div>
                        )}

                        <div className="p-4 bg-primary-light rounded-lg text-sm text-text-secondary border border-primary/20">
                            <p className="font-medium text-primary mb-1">{t`Current Network`}</p>
                            <p>
                                {network === "local"
                                    ? t`Local Network`
                                    : network === "sepolia"
                                    ? t`Sepolia Test Network`
                                    : t`Ethereum Mainnet`}
                            </p>
                            {network === "local" && contractAddress && (
                                <p className="mt-2">
                                    {t`Contract Address`}: {contractAddress}
                                </p>
                            )}
                            {feeReceiver && (
                                <p className="mt-2">
                                    {t`Fee Receiver`}: {feeReceiver}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={handleCollectFees}
                                disabled={
                                    isLoading ||
                                    contractLoading ||
                                    !campaignInfo
                                }
                                className="flex items-center px-4 py-2 bg-primary text-light rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-light border-t-transparent rounded-full animate-spin mr-2" />
                                ) : (
                                    <Wallet className="w-5 h-5 mr-2" />
                                )}
                                {t`Collect Fees`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
