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
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DeleteCampaignModal } from "../components/DeleteCampaignModal";
import { useAuth } from "../hooks/useAuth";
import { useEthPrice } from "../hooks/useEthPrice";
import { supabase } from "../lib/supabase";
import { Campaign } from "../lib/types";

type CampaignStatus = "all" | "active" | "ended";

export function MyCampaigns() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<CampaignStatus>("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
        null
    );
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { user } = useAuth();
    const { ethPrice } = useEthPrice();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchMyCampaigns();
        }
    }, [user]);

    const fetchMyCampaigns = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("campaigns")
                .select("*")
                .eq("creator_id", user?.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setCampaigns(data || []);
        } catch (err) {
            console.error("Error fetching campaigns:", err);
            setError("Failed to load your campaigns");
        } finally {
            setLoading(false);
        }
    };

    const filteredCampaigns = campaigns.filter((campaign) => {
        const isEnded = new Date(campaign.deadline) < new Date();

        switch (selectedStatus) {
            case "active":
                return !isEnded && campaign.status === "active";
            case "ended":
                return isEnded || campaign.status !== "active";
            default:
                return true;
        }
    });

    const handleEdit = (e: React.MouseEvent, campaign: Campaign) => {
        e.stopPropagation();
        navigate(`/campaign/edit/${campaign.id}`, { state: { campaign } });
    };

    const handleDelete = async () => {
        if (!selectedCampaign) return;

        try {
            const { error } = await supabase
                .from("campaigns")
                .delete()
                .eq("id", selectedCampaign.id)
                .eq("creator_id", user?.id);

            if (error) throw error;

            setCampaigns((prev) =>
                prev.filter((c) => c.id !== selectedCampaign.id)
            );
            setShowDeleteModal(false);
            setSelectedCampaign(null);
        } catch (err) {
            console.error("Error deleting campaign:", err);
            throw new Error("Failed to delete campaign");
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
        return diffDays > 0 ? `${diffDays} days left` : "Ended";
    };

    const getCampaignStats = () => {
        const now = new Date();
        const active = campaigns.filter(
            (c) => new Date(c.deadline) >= now && c.status === "active"
        ).length;
        const ended = campaigns.filter(
            (c) => new Date(c.deadline) < now && c.status === "active"
        ).length;
        const inactive = campaigns.filter((c) => c.status !== "active").length;
        return { active, ended, inactive };
    };

    const stats = getCampaignStats();

    return (
        <div className="min-h-screen bg-background pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-text mb-2">
                            My Campaigns
                        </h1>
                        <div className="text-text-secondary">
                            {stats.active} Active • {stats.ended} Ended •{" "}
                            {stats.inactive} Inactive
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/campaign/new")}
                        className="flex items-center px-4 py-2 bg-primary text-light rounded-lg hover:bg-primary-dark transition-colors group">
                        <Rocket className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                        New Campaign
                    </button>
                </div>

                <div className="flex items-center gap-2 mb-6">
                    {(["all", "active", "ended"] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                selectedStatus === status
                                    ? "bg-primary text-light"
                                    : "bg-background text-text-secondary hover:bg-primary-light hover:text-primary"
                            }`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
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
                            No Campaigns Yet
                        </h2>
                        <p className="text-text-secondary mb-8">
                            Start your first campaign and begin your fundraising
                            journey.
                        </p>
                        <button
                            onClick={() => navigate("/campaign/new")}
                            className="inline-flex items-center px-6 py-3 bg-primary text-light rounded-lg hover:bg-primary-dark transition-colors group">
                            <Rocket className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                            Create Campaign
                        </button>
                    </div>
                ) : filteredCampaigns.length === 0 ? (
                    <div className="text-center py-16">
                        <AlertCircle className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-text mb-2">
                            No {selectedStatus} campaigns
                        </h2>
                        <p className="text-text-secondary">
                            {selectedStatus === "active"
                                ? "All your campaigns have ended. Start a new one!"
                                : "You don't have any ended campaigns yet."}
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
                                <div className="relative h-48">
                                    <img
                                        src={
                                            campaign.images[0] ||
                                            "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80"
                                        }
                                        alt={campaign.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <div className="flex items-center justify-between text-light">
                                            <div className="flex items-center space-x-2 text-light text-sm">
                                                <Tag className="w-4 h-4" />
                                                <span>{campaign.category}</span>
                                            </div>
                                            <span
                                                className={`text-sm px-2 py-1 rounded-full ${
                                                    campaign.status !== "active"
                                                        ? "bg-gray-800/80"
                                                        : new Date(
                                                              campaign.deadline
                                                          ) < new Date()
                                                        ? "bg-error/80"
                                                        : "bg-success/80"
                                                }`}>
                                                {campaign.status !== "active"
                                                    ? "Inactive"
                                                    : new Date(
                                                          campaign.deadline
                                                      ) < new Date()
                                                    ? "Ended"
                                                    : "Active"}
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
                                                className="h-full bg-primary transition-all duration-300"
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
                                                ETH raised
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
                                                USD
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

                                    <div className="flex items-center justify-between">
                                        <button className="flex items-center text-primary transition-colors">
                                            <Target className="w-4 h-4 mr-1" />
                                            <span>
                                                {campaign.goal.toFixed(2)} ETH
                                                Goal
                                            </span>
                                        </button>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={(e) =>
                                                    handleEdit(e, campaign)
                                                }
                                                className="p-2 text-text-secondary hover:text-primary transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
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

            <DeleteCampaignModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedCampaign(null);
                }}
                onConfirm={handleDelete}
                campaignTitle={selectedCampaign?.title || ""}
            />
        </div>
    );
}
