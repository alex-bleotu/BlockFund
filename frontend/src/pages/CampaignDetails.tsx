import { motion } from "framer-motion";
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    Copy,
    Heart,
    MapPin,
    MessageCircle,
    Share2,
    Tag,
    Target,
    User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ContactModal } from "../components/ContactModal";
import { SupportModal } from "../components/SupportModal";
import { useAuth } from "../hooks/useAuth";
import { useCampaignActions } from "../hooks/useCampaignActions";
import { useEthPrice } from "../hooks/useEthPrice";
import { useMetaMask } from "../hooks/useMetaMask";
import { supabase } from "../lib/supabase";
import { Campaign } from "../lib/types";

export function CampaignDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { ethPrice } = useEthPrice();
    const { user } = useAuth();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
    const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);
    const { isLiked, toggleLike, shareCampaign } = useCampaignActions(id || "");
    const { isConnected, connect, isInstalled, isLocked } = useMetaMask();

    useEffect(() => {
        if (id) {
            fetchCampaign();
        }
    }, [id]);

    const fetchCampaign = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("campaigns")
                .select("*, profiles(id, username)")
                .eq("id", id)
                .single();

            if (error) throw error;
            setCampaign(data);
        } catch (err) {
            console.error("Error fetching campaign:", err);
            setError("Failed to load campaign details");
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        await shareCampaign();
        setShowCopiedTooltip(true);
        setTimeout(() => setShowCopiedTooltip(false), 2000);
    };

    const handleSupport = async (amount: number) => {
        console.log("Supporting campaign with", amount, "ETH");
    };

    const calculateProgress = (current: number, goal: number) => {
        return Math.min((current / goal) * 100, 100);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
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
                        Error Loading Campaign
                    </h2>
                    <p className="text-text-secondary mb-4">
                        {error || "Campaign not found"}
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-primary hover:text-primary-dark transition-colors">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const campaignEndDate = formatDate(campaign.deadline);
    const raised = campaign.raised || 0;

    return (
        <div className="min-h-screen bg-background pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-text-secondary hover:text-text mb-8 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Campaigns
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
                    <div className="space-y-8">
                        <div className="relative rounded-xl overflow-hidden shadow-lg bg-surface">
                            <img
                                src={
                                    campaign.images[currentImageIndex] ||
                                    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80"
                                }
                                alt={campaign.title}
                                className="w-full h-[400px] object-cover"
                            />
                            {campaign.images.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                                    {campaign.images.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() =>
                                                setCurrentImageIndex(index)
                                            }
                                            className={`w-2 h-2 rounded-full transition-colors ${
                                                currentImageIndex === index
                                                    ? "bg-primary"
                                                    : "bg-white/50 hover:bg-white/75"
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-surface rounded-xl p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                    <Tag className="w-5 h-5 text-primary" />
                                    <span className="text-text-secondary">
                                        {campaign.category}
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
                                                campaign.goal
                                            )}%`,
                                        }}
                                        transition={{ duration: 1 }}
                                        className="h-full bg-primary"
                                    />
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <div>
                                        <div className="text-2xl font-bold text-text">
                                            {raised.toFixed(2)} ETH
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
                                            {(
                                                (raised / campaign.goal) *
                                                100
                                            ).toFixed(1)}
                                            %
                                        </div>
                                        <div className="text-sm text-text-secondary">
                                            of {campaign.goal.toFixed(2)} ETH
                                            goal
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
                        <div className="lg:sticky lg:top-24 space-y-6 pb-4 px-4 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hide">
                            <div className="bg-surface rounded-xl p-6 shadow-lg">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-text-secondary">
                                        <div className="flex items-center">
                                            <Calendar className="w-5 h-5 mr-2" />
                                            <span>
                                                {campaignEndDate.hasEnded
                                                    ? "Campaign Ended"
                                                    : `${campaignEndDate.daysLeft} days left`}
                                            </span>
                                        </div>
                                        <span>{campaignEndDate.formatted}</span>
                                    </div>

                                    <div className="flex items-center text-text">
                                        <Target className="w-5 h-5 mr-2 text-primary" />
                                        <span className="font-medium">
                                            Goal: {campaign.goal.toFixed(2)} ETH
                                        </span>
                                    </div>

                                    {campaign.location && (
                                        <div className="flex items-center text-text-secondary">
                                            <MapPin className="w-5 h-5 mr-2" />
                                            <span>{campaign.location}</span>
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-1.5">
                                        <button
                                            onClick={() => {
                                                if (!isConnected || isLocked) {
                                                    connect();
                                                    return;
                                                }
                                                setIsSupportModalOpen(true);
                                            }}
                                            disabled={
                                                campaignEndDate.hasEnded ||
                                                !isInstalled ||
                                                !isConnected ||
                                                isLocked ||
                                                user?.id === campaign.creator_id
                                            }
                                            className={`w-full py-3 rounded-lg transition-colors ${
                                                campaignEndDate.hasEnded ||
                                                user?.id === campaign.creator_id
                                                    ? "bg-gray-400 cursor-not-allowed text-light/75"
                                                    : "bg-primary text-light hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed disabled:text-light/75"
                                            }`}>
                                            {campaignEndDate.hasEnded
                                                ? "Campaign Ended"
                                                : user?.id ===
                                                  campaign.creator_id
                                                ? "You are the creator"
                                                : "Support this Campaign"}
                                        </button>
                                        <p className="text-sm text-text-secondary text-center">
                                            {campaignEndDate.hasEnded
                                                ? "This campaign has ended."
                                                : user?.id ===
                                                  campaign.creator_id
                                                ? "You cannot support your own campaign."
                                                : !isInstalled
                                                ? "MetaMask is not installed."
                                                : isLocked
                                                ? "Your wallet is locked. Please unlock it to continue."
                                                : !isConnected
                                                ? "Connect your wallet to support this campaign."
                                                : "Support this campaign with ETH."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-surface rounded-xl p-6 shadow-lg">
                                <h3 className="text-xl font-bold text-text mb-4">
                                    About the Creator
                                </h3>
                                <Link
                                    to={`/profile/${campaign.creator_id}`}
                                    className="flex items-center space-x-4 group hover:bg-background-alt p-2 rounded-lg transition-colors">
                                    <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <User className="w-6 h-6 text-primary" />
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
                                    onClick={() => setIsContactModalOpen(true)}
                                    disabled={user?.id === campaign.creator_id}
                                    className={`w-full mt-4 py-2 border-2 border-primary rounded-lg transition-colors flex items-center justify-center ${
                                        user?.id === campaign.creator_id
                                            ? "border-gray-400 text-gray-400 cursor-not-allowed"
                                            : "text-primary hover:bg-primary hover:text-light"
                                    }`}>
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    {user?.id === campaign.creator_id
                                        ? "You are the creator"
                                        : "Contact Creator"}
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                creatorName={campaign.profiles?.username || "Creator"}
                campaignId={campaign.id || ""}
                creatorId={campaign.creator_id || ""}
            />

            <SupportModal
                isOpen={isSupportModalOpen}
                onClose={() => setIsSupportModalOpen(false)}
                campaignTitle={campaign.title}
                campaignGoal={campaign.goal}
                currentAmount={raised}
                onSupport={handleSupport}
            />
        </div>
    );
}
