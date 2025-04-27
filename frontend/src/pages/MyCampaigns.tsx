import { t } from "@lingui/core/macro";
import { motion } from "framer-motion";
import {
    AlertCircle,
    Calendar,
    Edit,
    MapPin,
    Rocket,
    Tag,
    Target,
    Trash2,
    Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { DeleteModal } from "../components/modals/DeleteModal";
import { useAuth } from "../hooks/useAuth";
import { useCampaignContract } from "../hooks/useCampaignContract";
import { useEthPrice } from "../hooks/useEthPrice";
import { supabase } from "../lib/supabase";
import { Campaign } from "../lib/types";
import { getCampaignCategory } from "../lib/utils";

type CampaignStatus = "all" | "active" | "ended" | "completed" | "inactive";

export function MyCampaigns() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<CampaignStatus>("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
        null
    );
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentNetwork, setCurrentNetwork] = useState<string | null>(null);
    const [creatorAddresses, setCreatorAddresses] = useState<{
        [key: number]: string;
    }>({});
    const { user } = useAuth();
    const { ethPrice } = useEthPrice();
    const { closeCampaign, getCampaign } = useCampaignContract();
    const navigate = useNavigate();

    useEffect(() => {
        const savedNetwork = localStorage.getItem("NETWORK");
        setCurrentNetwork(savedNetwork);
    }, []);

    useEffect(() => {
        if (user && currentNetwork) {
            fetchMyCampaigns();
        }
    }, [user, currentNetwork]);

    useEffect(() => {
        if (campaigns.length > 0) {
            fetchCreatorAddresses();
        }
    }, [campaigns]);

    const fetchMyCampaigns = async () => {
        if (!user) return;

        try {
            setLoading(true);

            const { data, error } = await supabase
                .from("campaigns")
                .select("*")
                .eq("creator_id", user.id)
                .eq("network", currentNetwork)
                .order("created_at", { ascending: false });

            if (error) throw error;

            setCampaigns(data || []);
        } catch (err) {
            console.error("Error fetching campaigns:", err);
            setError(t`Failed to load your campaigns`);
        } finally {
            setLoading(false);
        }
    };

    const fetchCreatorAddresses = async () => {
        const addresses: { [key: number]: string } = {};

        for (const campaign of campaigns) {
            if (campaign.onchain_id) {
                try {
                    const onChainCampaign = await getCampaign(
                        campaign.onchain_id
                    );
                    if (onChainCampaign) {
                        addresses[campaign.onchain_id] =
                            onChainCampaign.creator;
                    }
                } catch (err) {
                    console.error(
                        `Error fetching creator address for campaign ${campaign.id}:`,
                        err
                    );
                }
            }
        }

        setCreatorAddresses(addresses);
    };

    const filteredCampaigns = campaigns.filter((campaign) => {
        const isEnded = new Date(campaign.deadline) < new Date();

        switch (selectedStatus) {
            case "active":
                return !isEnded && campaign.status === "active";
            case "ended":
                return isEnded && campaign.status === "active";
            case "completed":
                return campaign.status === "completed";
            case "inactive":
                return campaign.status === "inactive";
            default:
                return true;
        }
    });

    const handleEdit = (e: React.MouseEvent, campaign: Campaign) => {
        e.stopPropagation();
        navigate(`/campaign/edit/${campaign.id}`, { state: { campaign } });
    };

    const handleDelete = async () => {
        if (
            !selectedCampaign ||
            !selectedCampaign.id ||
            !selectedCampaign.onchain_id
        ) {
            return;
        }

        try {
            setIsDeleting(true);

            const totalFunded = parseFloat(selectedCampaign.raised as any) || 0;
            const isCompleted = selectedCampaign.status === "completed";
            const hasFunds = totalFunded > 0;

            const canClose = !hasFunds || (hasFunds && isCompleted);

            if (!canClose) {
                toast.error(
                    t`Cannot delete campaign because the raised funds are not yet withdrawn.`
                );
                setIsDeleting(false);
                return;
            }

            if (!isCompleted) {
                try {
                    await closeCampaign(selectedCampaign.onchain_id);
                    console.log("Campaign successfully closed on blockchain");
                } catch (chainError: any) {
                    console.error(
                        "Error closing campaign on blockchain:",
                        chainError
                    );
                    if (chainError.message.includes("Only creator can close")) {
                        toast.error(
                            t`Please connect the wallet that created this campaign to delete it.`
                        );
                    } else {
                        toast.error(
                            t`Could not close campaign on blockchain. Delete aborted.`
                        );
                    }
                    return;
                }
            }

            if (selectedCampaign.images?.length) {
                try {
                    const imagePaths = selectedCampaign.images
                        .map((imageUrl) => {
                            const urlObj = new URL(imageUrl);
                            const parts = urlObj.pathname.split("/");
                            const idx = parts.findIndex(
                                (p) => p === "campaign-images"
                            );
                            return idx >= 0 && idx < parts.length - 1
                                ? parts.slice(idx + 1).join("/")
                                : null;
                        })
                        .filter((p): p is string => Boolean(p));

                    if (imagePaths.length) {
                        const { error: storageError } = await supabase.storage
                            .from("campaign-images")
                            .remove(imagePaths);

                        if (storageError) {
                            console.error(
                                "Error deleting campaign images:",
                                storageError
                            );
                        } else {
                            console.log("Successfully deleted campaign images");
                        }
                    }
                } catch (storageError) {
                    console.error(
                        "Error processing image deletion:",
                        storageError
                    );
                }
            }

            const { error } = await supabase
                .from("campaigns")
                .delete()
                .eq("id", selectedCampaign.id)
                .eq("creator_id", user?.id);

            if (error) throw error;

            setCampaigns((prev) =>
                prev.filter((c) => c.id !== selectedCampaign.id)
            );
            toast.success(t`Campaign deleted successfully`);
            setShowDeleteModal(false);
            setSelectedCampaign(null);
        } catch (err: any) {
            console.error("Error deleting campaign:", err);
            toast.error(err.message || t`Failed to delete campaign`);
        } finally {
            setIsDeleting(false);
        }
    };

    const calculateProgress = (current: number, goal: number) => {
        return Math.min((current / goal) * 100, 100);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays + " " + t`days left` : t`Ended`;
    };

    const getCampaignStats = () => {
        const now = new Date();
        const active = campaigns.filter(
            (c) => new Date(c.deadline) >= now && c.status === "active"
        ).length;
        const ended = campaigns.filter(
            (c) => new Date(c.deadline) < now && c.status === "active"
        ).length;
        const completed = campaigns.filter(
            (c) => c.status === "completed"
        ).length;
        const inactive = campaigns.filter(
            (c) => c.status !== "active" && c.status !== "completed"
        ).length;
        return { active, ended, inactive, completed };
    };

    const stats = getCampaignStats();

    return (
        <div className="min-h-screen bg-background pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center sm:mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-text mb-2">
                            {t`My Campaigns`}
                        </h1>
                        <div className="text-text-secondary">
                            {stats.active} {t`Active`} • {stats.ended}{" "}
                            {t`Ended`} • {stats.completed} {t`Completed`} •{" "}
                            {stats.inactive} {t`Inactive`}
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/campaign/new")}
                        className="hidden sm:flex items-center px-4 py-2 bg-primary text-light rounded-lg hover:bg-primary-dark transition-colors group">
                        <Rocket className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                        {t`New Campaign`}
                    </button>
                </div>

                <button
                    onClick={() => navigate("/campaign/new")}
                    className="flex sm:hidden items-center px-4 py-2 bg-primary text-light rounded-lg hover:bg-primary-dark transition-colors group mb-8 mt-4">
                    <Rocket className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    {t`New Campaign`}
                </button>

                <div className="flex items-center gap-2 mb-6 flex-wrap">
                    {(
                        [
                            "all",
                            "active",
                            "ended",
                            "completed",
                            "inactive",
                        ] as const
                    ).map((status) => (
                        <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                selectedStatus === status
                                    ? "bg-primary text-light"
                                    : "bg-background text-text-secondary hover:bg-primary-light hover:text-primary"
                            }`}>
                            {status === "all"
                                ? t`All`
                                : status === "active"
                                ? t`Active`
                                : status === "completed"
                                ? t`Completed`
                                : status === "inactive"
                                ? t`Inactive`
                                : t`Ended`}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center items-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : error ? (
                    <div className="text-center text-error">{error}</div>
                ) : campaigns.length === 0 ? (
                    <div className="text-center py-16">
                        <AlertCircle className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-text mb-2">
                            {t`No Campaigns Yet`}
                        </h2>
                        <p className="text-text-secondary mb-8">
                            {t`Start your first campaign and begin your fundraising journey.`}
                        </p>
                        <button
                            onClick={() => navigate("/campaign/new")}
                            className="inline-flex items-center px-6 py-3 bg-primary text-light rounded-lg hover:bg-primary-dark transition-colors group">
                            <Rocket className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                            {t`Create Campaign`}
                        </button>
                    </div>
                ) : filteredCampaigns.length === 0 ? (
                    <div className="text-center py-16">
                        <AlertCircle className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-text mb-2">
                            {t`No ${selectedStatus} campaigns`}
                        </h2>
                        <p className="text-text-secondary">
                            {selectedStatus === "active"
                                ? t`All your campaigns have ended. Start a new one!`
                                : t`You don't have any ended campaigns yet.`}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCampaigns.map((campaign, index) => (
                            <motion.div
                                key={campaign.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-surface rounded-xl shadow-lg overflow-hidden group cursor-pointer"
                                onClick={() =>
                                    navigate(`/campaign/${campaign.id}`)
                                }>
                                <div className="relative aspect-video overflow-hidden">
                                    <img
                                        src={campaign.images[0]}
                                        alt={campaign.title}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <div className="flex items-center justify-between text-light">
                                            <div className="flex items-center space-x-2 text-light text-sm">
                                                <Tag className="w-4 h-4" />
                                                <span>
                                                    {getCampaignCategory(
                                                        campaign.category
                                                    )}
                                                </span>
                                            </div>
                                            <span
                                                className={`text-sm px-2 py-1 rounded-full ${
                                                    campaign.status !== "active"
                                                        ? campaign.status ===
                                                          "completed"
                                                            ? "bg-success/80"
                                                            : "bg-gray-800/80"
                                                        : new Date(
                                                              campaign.deadline
                                                          ) < new Date()
                                                        ? "bg-error/80"
                                                        : "bg-primary/80"
                                                }`}>
                                                {campaign.status !== "active"
                                                    ? campaign.status ===
                                                      "completed"
                                                        ? t`Completed`
                                                        : t`Inactive`
                                                    : new Date(
                                                          campaign.deadline
                                                      ) < new Date()
                                                    ? t`Ended`
                                                    : t`Active`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-text mb-2 line-clamp-1">
                                        {campaign.title}
                                    </h3>
                                    <p className="text-text-secondary mb-4 line-clamp-2">
                                        {campaign.summary}
                                    </p>

                                    <div className="mb-4">
                                        <div className="h-2 bg-background-alt rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${
                                                    campaign.status ===
                                                    "completed"
                                                        ? "bg-success"
                                                        : "bg-primary"
                                                } transition-all duration-300`}
                                                style={{
                                                    width: `${calculateProgress(
                                                        campaign.raised || 0,
                                                        campaign.goal
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center mt-2 text-sm">
                                            <span className="text-text-secondary">
                                                {(campaign.raised || 0).toFixed(
                                                    2
                                                )}{" "}
                                                {t`ETH raised`}
                                            </span>
                                            <span className="text-text font-medium">
                                                {(
                                                    ((campaign.raised || 0) /
                                                        campaign.goal) *
                                                    100
                                                ).toFixed(1)}
                                                %
                                            </span>
                                        </div>
                                        {ethPrice && (
                                            <div className="text-xs text-text-secondary mt-1">
                                                ≈ $
                                                {(
                                                    (campaign.raised || 0) *
                                                    ethPrice
                                                ).toLocaleString()}{" "}
                                                {t`USD`}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-text-secondary mb-4">
                                        {campaign.location && (
                                            <div className="flex items-center">
                                                <MapPin className="w-4 h-4 mr-1" />
                                                <span>{campaign.location}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            <span>
                                                {formatDate(campaign.deadline)}
                                            </span>
                                        </div>
                                    </div>

                                    {campaign.onchain_id &&
                                        creatorAddresses[
                                            campaign.onchain_id
                                        ] && (
                                            <div className="flex items-center text-sm text-text-secondary mb-4">
                                                <Wallet className="w-4 h-4 mr-1" />
                                                <span className="font-mono">
                                                    {creatorAddresses[
                                                        campaign.onchain_id
                                                    ].slice(0, 6)}
                                                    ...
                                                    {creatorAddresses[
                                                        campaign.onchain_id
                                                    ].slice(-4)}
                                                </span>
                                            </div>
                                        )}

                                    <div className="flex items-center justify-between">
                                        <button className="flex items-center text-primary transition-colors">
                                            <Target className="w-4 h-4 mr-1" />
                                            <span className="text-left">
                                                {campaign.goal.toFixed(3)} ETH{" "}
                                                {t`Goal`}
                                            </span>
                                        </button>
                                        <div className="flex items-center space-x-2">
                                            {new Date(campaign.deadline) >
                                                new Date() &&
                                                campaign.status !==
                                                    "completed" && (
                                                    <button
                                                        onClick={(e) =>
                                                            handleEdit(
                                                                e,
                                                                campaign
                                                            )
                                                        }
                                                        className="p-2 text-text-secondary hover:text-primary transition-colors">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedCampaign(
                                                        campaign
                                                    );
                                                    setShowDeleteModal(true);
                                                }}
                                                className="p-2 text-text-secondary hover:text-error transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedCampaign(null);
                }}
                onConfirm={handleDelete}
                campaignTitle={selectedCampaign?.title || ""}
                isDeleting={isDeleting}
            />
        </div>
    );
}
