import { t } from "@lingui/core/macro";
import { motion } from "framer-motion";
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Copy,
    Edit,
    Heart,
    MapPin,
    MessageCircle,
    Share2,
    Tag,
    Target,
    User,
    Wallet,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ContactModal } from "../components/ContactModal";
import { SupportModal } from "../components/SupportModal";
import { WithdrawModal } from "../components/WithdrawModal";
import { useAuth } from "../hooks/useAuth";
import { useCampaignActions } from "../hooks/useCampaignActions";
import { useCampaignContract } from "../hooks/useCampaignContract";
import { useEthPrice } from "../hooks/useEthPrice";
import { useMetaMask } from "../hooks/useMetaMask";
import { supabase } from "../lib/supabase";
import { Campaign } from "../lib/types";
import { getCampaignCategory } from "../lib/utils";

interface OnChainCampaign {
    id: number;
    creator: string;
    goal: string;
    deadline: Date;
    totalFunded: string;
    metadataCID: string;
    status: string;
}

export function CampaignDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { ethPrice } = useEthPrice();
    const { user } = useAuth();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [onChainData, setOnChainData] = useState<OnChainCampaign | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [onchainLoading, setOnchainLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
    const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);
    const [onchainId, setOnchainId] = useState<number | null>(null);
    const { isLiked, toggleLike, shareCampaign } = useCampaignActions(id || "");
    const { isConnected, connect, isInstalled, isLocked } = useMetaMask();
    const {
        contribute,
        getCampaign,
        loading: contractLoading,
        contract,
        withdraw,
    } = useCampaignContract();
    const [transactionInProgress, setTransactionInProgress] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const hasConnected = useRef(false);

    useEffect(() => {
        const connectWallet = async () => {
            if (hasConnected.current) return;
            hasConnected.current = true;

            await connect();
        };

        connectWallet();
    }, []);

    useEffect(() => {
        if (id) {
            fetchCampaign();
        }
    }, [id]);

    useEffect(() => {
        if (contract && onchainId) {
            fetchOnChainData(onchainId);
        }
    }, [contract, onchainId]);

    const fetchCampaign = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("campaigns")
                .select("*, profiles(id, username)")
                .eq("id", id)
                .single();

            if (error) throw error;

            if (data.status === "inactive" && data.creator_id !== user?.id) {
                throw new Error("This campaign is not available");
            }

            setCampaign(data);

            if (data.onchain_id) {
                setOnchainId(data.onchain_id);
            }
        } catch (err) {
            console.error("Error fetching campaign:", err);
            setError("Failed to load campaign details");
        } finally {
            setLoading(false);
        }
    };

    const fetchOnChainData = async (onchainId: number) => {
        try {
            if (!onchainId || !contract) return;

            setOnchainLoading(true);
            const onChainCampaign = await getCampaign(onchainId);
            setOnChainData(onChainCampaign);
        } catch (err) {
            console.error("Error fetching on-chain data:", err);
        } finally {
            setOnchainLoading(false);
        }
    };

    const handleShare = async () => {
        await shareCampaign();
        setShowCopiedTooltip(true);
        setTimeout(() => setShowCopiedTooltip(false), 2000);
    };

    const handleSupport = async (amount: number) => {
        try {
            setTransactionInProgress(true);

            if (!onchainId) return;
            const formattedAmount = amount.toFixed(18);

            await contribute(onchainId, formattedAmount);
            const onchainCampaign = await getCampaign(onchainId);

            if (campaign && campaign.id && onchainCampaign) {
                try {
                    const { error: updateError } = await supabase
                        .from("campaigns")
                        .update({
                            raised: onchainCampaign.totalFunded,
                            updated_at: new Date().toISOString(),
                        })
                        .eq("id", campaign.id)
                        .select()
                        .single();

                    if (updateError) {
                        console.error(
                            "Error updating campaign in database:",
                            updateError
                        );
                        toast.error(
                            "Transaction successful but failed to update database records"
                        );
                    } else {
                        setCampaign((prev) =>
                            prev
                                ? {
                                      ...prev,
                                      raised: Number(
                                          onchainCampaign.totalFunded
                                      ),
                                  }
                                : prev
                        );
                        toast.success(
                            "Thank you for your support! Campaign updated successfully."
                        );
                    }
                } catch (dbError) {
                    console.error("Database update error:", dbError);
                    toast.error(
                        "Transaction successful but failed to update campaign data"
                    );
                }
            } else {
                toast.success("Thank you for your support!");
            }

            if (onchainId) {
                fetchOnChainData(onchainId);
            }

            setIsSupportModalOpen(false);
        } catch (err: any) {
            console.error("Transaction error:", err);
            throw err;
        } finally {
            setTransactionInProgress(false);
        }
    };

    const handleWithdraw = async () => {
        try {
            setTransactionInProgress(true);

            if (!onchainId) return;

            await withdraw(onchainId);

            if (campaign && campaign.id) {
                try {
                    const { error: updateError } = await supabase
                        .from("campaigns")
                        .update({
                            status: "completed",
                            updated_at: new Date().toISOString(),
                        })
                        .eq("id", campaign.id);

                    if (updateError) {
                        console.error(
                            "Error updating campaign in database:",
                            updateError
                        );
                        toast.error(
                            "Withdrawal successful but failed to update database records"
                        );
                    } else {
                        setCampaign((prev) => {
                            if (!prev) return null;
                            return {
                                ...prev,
                                status: "completed",
                            };
                        });
                        toast.success(
                            "Funds withdrawn successfully. Campaign is now closed."
                        );
                    }
                } catch (dbError) {
                    console.error("Database update error:", dbError);
                    toast.error(
                        "Withdrawal successful but failed to update campaign data"
                    );
                }
            } else {
                toast.success("Funds withdrawn successfully!");
            }

            if (onchainId) {
                fetchOnChainData(onchainId);
            }

            setIsWithdrawModalOpen(false);
        } catch (err: any) {
            console.error("Withdrawal error:", err);
            toast.error("Failed to withdraw funds. Please try again.");
        } finally {
            setTransactionInProgress(false);
        }
    };

    const calculateProgress = (current: number, goal: number) => {
        return Math.min((current / goal) * 100, 100);
    };

    const formatDate = (dateString: string | Date) => {
        const date =
            dateString instanceof Date ? dateString : new Date(dateString);
        const today = new Date();
        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
            formatted: date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
            daysLeft: diffDays,
            hasEnded: diffDays < 0,
        };
    };

    const handlePrevImage = () => {
        if (!campaign?.images?.length) return;
        setCurrentImageIndex((prev) =>
            prev === 0 ? campaign.images.length - 1 : prev - 1
        );
    };

    const handleNextImage = () => {
        if (!campaign?.images?.length) return;
        setCurrentImageIndex((prev) =>
            prev === campaign.images.length - 1 ? 0 : prev + 1
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !campaign) {
        return (
            <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-text mb-2">
                        {t`Error Loading Campaign`}
                    </h2>
                    <p className="text-text-secondary mb-4">
                        {error || t`Campaign not found`}
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-primary hover:text-primary-dark transition-colors">
                        {t`Go Back`}
                    </button>
                </div>
            </div>
        );
    }

    const campaignEndDate = formatDate(
        onChainData?.deadline || campaign.deadline
    );
    const goal = onChainData ? parseFloat(onChainData.goal) : campaign.goal;
    const raised = onChainData
        ? parseFloat(onChainData.totalFunded)
        : campaign.raised || 0;

    return (
        <div className="min-h-screen bg-background pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate("/campaigns")}
                    className="flex items-center text-text-secondary hover:text-text mb-8 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    {t`Back to Campaigns`}
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
                    <div className="space-y-8">
                        <div className="relative rounded-xl overflow-hidden shadow-lg bg-surface">
                            <motion.img
                                key={currentImageIndex}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                src={
                                    campaign.images[currentImageIndex] ||
                                    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80"
                                }
                                alt={campaign.title}
                                className="w-full h-[400px] object-cover"
                            />
                            {campaign.images.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 transition-colors group">
                                        <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 transition-colors group">
                                        <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    </button>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                                        {campaign.images.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() =>
                                                    setCurrentImageIndex(index)
                                                }
                                                className={`w-2 h-2 rounded-full transition-all ${
                                                    currentImageIndex === index
                                                        ? "bg-primary scale-125"
                                                        : "bg-white/50 hover:bg-white/75"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="bg-surface rounded-xl p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                    <Tag className="w-5 h-5 text-primary" />
                                    <span className="text-text-secondary">
                                        {getCampaignCategory(campaign.category)}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={toggleLike}
                                        className={`p-2 rounded-full transition-colors ${
                                            isLiked
                                                ? "text-primary bg-primary-light"
                                                : "text-text-secondary hover:text-primary hover:bg-primary-light/50"
                                        }`}>
                                        <Heart
                                            className={`w-5 h-5 ${
                                                isLiked ? "fill-current" : ""
                                            }`}
                                        />
                                    </button>
                                    {user?.id === campaign.creator_id &&
                                        new Date(campaign.deadline) >
                                            new Date() && (
                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/campaign/edit/${campaign.id}`
                                                    )
                                                }
                                                className="p-2 text-text-secondary hover:text-primary transition-colors rounded-full hover:bg-primary-light/50">
                                                <Edit className="w-5 h-5" />
                                            </button>
                                        )}
                                    <div className="relative">
                                        <button
                                            onClick={handleShare}
                                            className="p-2 text-text-secondary hover:text-primary transition-colors rounded-full hover:bg-primary-light/50">
                                            {showCopiedTooltip ? (
                                                <Copy className="w-5 h-5" />
                                            ) : (
                                                <Share2 className="w-5 h-5" />
                                            )}
                                        </button>
                                        {showCopiedTooltip && (
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-surface text-text text-sm rounded shadow-lg whitespace-nowrap">
                                                Copied to clipboard!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <h1 className="text-3xl font-bold text-text mb-4">
                                {campaign.title}
                            </h1>

                            <div className="mb-6">
                                <p className="text-lg text-text-secondary leading-relaxed">
                                    {campaign.summary}
                                </p>
                            </div>

                            <div className="mb-6">
                                <div className="h-2 bg-background-alt rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${calculateProgress(
                                                raised,
                                                goal
                                            )}%`,
                                        }}
                                        transition={{ duration: 1 }}
                                        className="h-full bg-primary"
                                    />
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <div>
                                        <div className="flex items-center justify-center mb-1">
                                            <img
                                                src="/eth.svg"
                                                alt="Ethereum"
                                                className="w-6 h-6 mr-1"
                                            />
                                            <div className="text-2xl font-bold text-text">
                                                {raised.toFixed(3)} ETH
                                            </div>
                                        </div>
                                        {ethPrice && (
                                            <div className="text-sm text-text-secondary">
                                                ≈ $
                                                {(
                                                    raised * ethPrice
                                                ).toLocaleString()}{" "}
                                                USD
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-medium text-text">
                                            {((raised / goal) * 100).toFixed(1)}
                                            %
                                        </div>
                                        <div className="text-sm text-text-secondary">
                                            of {goal.toFixed(3)} ETH goal
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="prose prose-sm max-w-none text-text-secondary">
                                {campaign.description
                                    .split("\n")
                                    .map((paragraph, index) => (
                                        <p key={index} className="mb-4">
                                            {paragraph}
                                        </p>
                                    ))}
                            </div>
                        </div>
                    </div>

                    <aside className="lg:relative">
                        <div className="lg:sticky lg:top-24 space-y-6 pb-4 lg:px-4 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hide">
                            <div className="bg-surface rounded-xl p-6 shadow-lg">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-text-secondary">
                                        <div className="flex items-center">
                                            <Calendar className="w-5 h-5 mr-2" />
                                            <span>
                                                {campaignEndDate.hasEnded
                                                    ? t`Campaign Ended`
                                                    : campaignEndDate.daysLeft +
                                                      " " +
                                                      t`days left`}
                                            </span>
                                        </div>
                                        <span>{campaignEndDate.formatted}</span>
                                    </div>

                                    <div className="flex items-center text-text">
                                        <Target className="w-5 h-5 mr-2 text-primary" />
                                        <span className="font-medium">
                                            {t`Goal:`} {goal.toFixed(3)} ETH
                                        </span>
                                    </div>

                                    {campaign.location && (
                                        <div className="flex items-center text-text-secondary">
                                            <MapPin className="w-5 h-5 mr-2" />
                                            <span>{campaign.location}</span>
                                        </div>
                                    )}

                                    <div className="p-3 bg-primary-light rounded-lg text-sm">
                                        {onchainLoading ? (
                                            <>
                                                <div className="font-medium text-primary mb-1">
                                                    {t`Blockchain Status`}
                                                </div>
                                                <div className="flex items-center text-text-secondary">
                                                    <div className="w-4 h-4 mr-2 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                    {t`Loading blockchain data...`}
                                                </div>
                                            </>
                                        ) : onchainId && !onChainData ? (
                                            <div className="text-primary font-medium">
                                                {t`Please connect your wallet!`}
                                            </div>
                                        ) : (
                                            <>
                                                <div className="font-medium text-primary mb-1">
                                                    {t`Blockchain Status`}
                                                </div>
                                                <div className="text-text-secondary">
                                                    {t`Status:`}{" "}
                                                    <span className="font-semibold">
                                                        {onChainData
                                                            ? t`ACTIVE`
                                                            : t`INACTIVE`}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        {!isConnected || isLocked ? (
                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        "/settings?tab=wallet"
                                                    )
                                                }
                                                className="w-full py-3 rounded-lg transition-colors bg-primary text-light hover:bg-primary-dark flex items-center justify-center space-x-2"
                                                disabled={!isInstalled}>
                                                <Wallet className="w-4 h-4" />
                                                <span>
                                                    {!isInstalled
                                                        ? t`MetaMask Not Installed`
                                                        : t`Connect Wallet`}
                                                </span>
                                            </button>
                                        ) : user?.id === campaign.creator_id ? (
                                            <button
                                                onClick={() =>
                                                    setIsWithdrawModalOpen(true)
                                                }
                                                disabled={
                                                    transactionInProgress ||
                                                    contractLoading ||
                                                    !onChainData ||
                                                    Number(
                                                        onChainData?.totalFunded ||
                                                            0
                                                    ) === 0 ||
                                                    !isInstalled ||
                                                    campaign.status ===
                                                        "completed"
                                                }
                                                className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                                                    transactionInProgress ||
                                                    contractLoading ||
                                                    !onChainData ||
                                                    Number(
                                                        onChainData?.totalFunded ||
                                                            0
                                                    ) === 0 ||
                                                    !isInstalled ||
                                                    campaign.status ===
                                                        "completed"
                                                        ? "bg-gray-400 cursor-not-allowed text-light/75"
                                                        : "bg-primary text-light hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed disabled:text-light/75"
                                                }`}>
                                                <Wallet className="w-4 h-4" />
                                                <span>
                                                    {transactionInProgress
                                                        ? t`Transaction in progress...`
                                                        : contractLoading
                                                        ? t`Loading...`
                                                        : t`Withdraw Funds`}
                                                </span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    if (!user) {
                                                        navigate("/login", {
                                                            state: {
                                                                from: `/campaign/${campaign.id}`,
                                                            },
                                                        });
                                                        return;
                                                    }
                                                    setIsSupportModalOpen(true);
                                                }}
                                                disabled={
                                                    campaignEndDate.hasEnded ||
                                                    !isInstalled ||
                                                    transactionInProgress ||
                                                    contractLoading ||
                                                    !onChainData ||
                                                    campaign.status ===
                                                        "completed"
                                                }
                                                className={`w-full py-3 rounded-lg transition-colors ${
                                                    campaignEndDate.hasEnded ||
                                                    transactionInProgress ||
                                                    contractLoading ||
                                                    !onChainData ||
                                                    !isInstalled ||
                                                    campaign.status ===
                                                        "completed"
                                                        ? "bg-gray-400 cursor-not-allowed text-light/75"
                                                        : "bg-primary text-light hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed disabled:text-light/75"
                                                }`}>
                                                {transactionInProgress
                                                    ? t`Transaction in progress...`
                                                    : contractLoading
                                                    ? t`Loading...`
                                                    : campaignEndDate.hasEnded
                                                    ? t`Campaign Ended`
                                                    : campaign.status ===
                                                      "completed"
                                                    ? t`Campaign Completed`
                                                    : t`Contribute to this Campaign`}
                                            </button>
                                        )}
                                        {!isLocked &&
                                            (isConnected ||
                                                !user ||
                                                user?.id ===
                                                    campaign.creator_id) && (
                                                <p className="text-sm text-text-secondary text-center">
                                                    {campaignEndDate.hasEnded
                                                        ? t`This campaign has ended.`
                                                        : campaign.status ===
                                                          "completed"
                                                        ? t`This campaign has been completed. No further actions are possible.`
                                                        : user?.id ===
                                                          campaign.creator_id
                                                        ? !isInstalled
                                                            ? t`MetaMask is not installed.`
                                                            : !onChainData
                                                            ? t`This campaign is not active on the blockchain.`
                                                            : onChainData.status ===
                                                              "CLOSED"
                                                            ? t`This campaign is already closed.`
                                                            : Number(
                                                                  onChainData.totalFunded ||
                                                                      0
                                                              ) === 0
                                                            ? t`No funds available to withdraw.`
                                                            : t`Withdraw funds to close this campaign.`
                                                        : !user
                                                        ? t`Please sign in to contribute to this campaign.`
                                                        : !isInstalled
                                                        ? t`MetaMask is not installed.`
                                                        : !onChainData
                                                        ? t`This campaign is not active on the blockchain.`
                                                        : t`Contribute to this campaign with ETH.`}
                                                </p>
                                            )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-surface rounded-xl p-6 shadow-lg">
                                <h3 className="text-xl font-bold text-text mb-4">
                                    {t`About the Creator`}
                                </h3>
                                <Link
                                    to={`/profile/${campaign.creator_id}`}
                                    className="flex items-center space-x-4 group hover:bg-background-alt p-2 rounded-lg transition-colors">
                                    <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                                        {campaign.profiles?.username ? (
                                            <span className="text-md font-bold text-primary">
                                                {campaign.profiles.username
                                                    .split(" ")
                                                    .map((word) => word[0])
                                                    .join("")
                                                    .toUpperCase()
                                                    .substring(0, 2)}
                                            </span>
                                        ) : (
                                            <User className="w-6 h-6 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium text-text group-hover:text-primary transition-colors">
                                            {campaign.profiles?.username ||
                                                "Campaign Creator"}
                                        </div>
                                        <div className="text-sm text-text-secondary">
                                            {campaign.location || "Creator"}
                                        </div>
                                    </div>
                                </Link>
                                <button
                                    onClick={() => {
                                        if (!user) {
                                            navigate("/login", {
                                                state: {
                                                    from: `/campaign/${campaign.id}`,
                                                },
                                            });
                                            return;
                                        }
                                        setIsContactModalOpen(true);
                                    }}
                                    disabled={user?.id === campaign.creator_id}
                                    className={`w-full mt-4 py-2 border-2 rounded-lg transition-colors flex items-center justify-center ${
                                        user?.id === campaign.creator_id
                                            ? "border-gray-400 text-gray-400 cursor-not-allowed"
                                            : "border-primary text-primary hover:bg-primary hover:text-light"
                                    }`}>
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    {user?.id === campaign.creator_id
                                        ? t`You are the creator`
                                        : !user
                                        ? t`Sign in to Contact`
                                        : t`Contact Creator`}
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {campaign &&
                campaign.profiles?.username &&
                campaign.creator_id &&
                campaign.id && (
                    <ContactModal
                        isOpen={isContactModalOpen}
                        onClose={() => setIsContactModalOpen(false)}
                        creatorName={campaign.profiles?.username}
                        campaignId={campaign.id}
                        creatorId={campaign.creator_id}
                    />
                )}

            <SupportModal
                isOpen={isSupportModalOpen}
                onClose={() => setIsSupportModalOpen(false)}
                campaignTitle={campaign.title}
                campaignGoal={goal}
                currentAmount={raised}
                onSupport={handleSupport}
            />

            <WithdrawModal
                isOpen={isWithdrawModalOpen}
                onClose={() => setIsWithdrawModalOpen(false)}
                campaignTitle={campaign.title}
                amount={onChainData?.totalFunded}
                onConfirm={handleWithdraw}
                isProcessing={transactionInProgress}
            />
        </div>
    );
}
