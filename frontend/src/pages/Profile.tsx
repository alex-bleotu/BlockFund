import { t } from "@lingui/core/macro";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowLeft,
    Calendar,
    MapPin,
    MessageCircle,
    Tag,
    Target,
    User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ContactModal } from "../components/ContactModal";
import { useAuth } from "../hooks/useAuth";
import { useEthPrice } from "../hooks/useEthPrice";
import { supabase } from "../lib/supabase";
import { Campaign } from "../lib/types";

interface UserProfile {
    id: string;
    username: string;
    bio: string | null;
    location: string | null;
    created_at: string;
}

export function Profile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const { ethPrice } = useEthPrice();

    useEffect(() => {
        if (id) {
            fetchProfile();
        }
    }, [id]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", id)
                .single();

            if (profileError) throw profileError;
            if (!profileData) throw new Error(t`Profile not found`);

            setProfile(profileData);

            const { data: campaignsData, error: campaignsError } =
                await supabase
                    .from("campaigns")
                    .select("*")
                    .eq("creator_id", id)
                    .eq("status", "active")
                    .order("created_at", { ascending: false });

            if (campaignsError) throw campaignsError;
            setCampaigns(campaignsData || []);
        } catch (err) {
            console.error("Error fetching profile:", err);
            setError(t`Failed to load profile`);
        } finally {
            setLoading(false);
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

    const isCampaignEnded = (deadline: string) => {
        return new Date(deadline) < new Date();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-text mb-2">
                        {t`Error Loading Profile`}
                    </h2>
                    <p className="text-text-secondary mb-4">
                        {error || t`Profile not found`}
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

    return (
        <div className="min-h-screen bg-background pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-text-secondary hover:text-text mb-8 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    {t`Back`}
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
                    <div className="space-y-8">
                        <div className="bg-surface rounded-xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-text mb-6">
                                {t`Campaigns`}
                            </h2>
                            {campaigns.length === 0 ? (
                                <p className="text-text-secondary">
                                    {t`No campaigns yet`}
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                    <AnimatePresence mode="popLayout">
                                        {campaigns.map((campaign, index) => (
                                            <motion.div
                                                key={campaign.id}
                                                layout
                                                initial={{
                                                    opacity: 0,
                                                    scale: 0.9,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    scale: 1,
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                    scale: 0.9,
                                                }}
                                                transition={{ duration: 0.3 }}
                                                className="bg-surface rounded-xl shadow-lg overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300"
                                                onClick={() =>
                                                    navigate(
                                                        `/campaign/${campaign.id}`
                                                    )
                                                }>
                                                <div className="relative h-48 overflow-hidden">
                                                    <img
                                                        src={
                                                            campaign
                                                                .images[0] ||
                                                            "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80"
                                                        }
                                                        alt={campaign.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                                    <div className="absolute bottom-4 left-4 right-4">
                                                        <div className="flex items-center justify-between text-light">
                                                            <div className="flex items-center space-x-2 text-light text-sm">
                                                                <Tag className="w-4 h-4" />
                                                                <span>
                                                                    {
                                                                        campaign.category
                                                                    }
                                                                </span>
                                                            </div>
                                                            <span
                                                                className={`text-sm px-2 py-1 rounded-full ${
                                                                    campaign.status !==
                                                                    "active"
                                                                        ? "bg-error/80"
                                                                        : isCampaignEnded(
                                                                              campaign.deadline
                                                                          )
                                                                        ? "bg-error/80"
                                                                        : "bg-success/80"
                                                                }`}>
                                                                {campaign.status !==
                                                                "active"
                                                                    ? t`Inactive`
                                                                    : isCampaignEnded(
                                                                          campaign.deadline
                                                                      )
                                                                    ? t`Ended`
                                                                    : t`Active`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-6">
                                                    <h3 className="text-xl font-bold text-text mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                                        {campaign.title}
                                                    </h3>
                                                    <p className="text-text-secondary mb-4 line-clamp-2">
                                                        {campaign.summary}
                                                    </p>

                                                    <div className="mb-4">
                                                        <div className="h-2 bg-background-alt rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{
                                                                    width: 0,
                                                                }}
                                                                animate={{
                                                                    width: `${calculateProgress(
                                                                        campaign.raised ||
                                                                            0,
                                                                        campaign.goal
                                                                    )}%`,
                                                                }}
                                                                transition={{
                                                                    duration: 1,
                                                                    delay:
                                                                        index *
                                                                        0.1,
                                                                }}
                                                                className="h-full bg-primary"
                                                            />
                                                        </div>
                                                        <div className="flex justify-between items-center mt-2 text-sm">
                                                            <span className="text-text-secondary">
                                                                {(
                                                                    campaign.raised ||
                                                                    0
                                                                ).toFixed(
                                                                    3
                                                                )}{" "}
                                                                {t`ETH raised`}
                                                            </span>
                                                            <span className="text-text font-medium">
                                                                {(
                                                                    ((campaign.raised ||
                                                                        0) /
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
                                                                    (campaign.raised ||
                                                                        0) *
                                                                    ethPrice
                                                                ).toLocaleString()}{" "}
                                                                {t`USD`}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between text-sm text-text-secondary">
                                                        <div className="flex items-center space-x-4">
                                                            {campaign.location && (
                                                                <div className="flex items-center">
                                                                    <MapPin className="w-4 h-4 mr-1" />
                                                                    <span>
                                                                        {
                                                                            campaign.location
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center">
                                                                <Calendar className="w-4 h-4 mr-1" />
                                                                <span>
                                                                    {formatDate(
                                                                        campaign.deadline
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center text-primary font-medium mt-4">
                                                        <Target className="w-4 h-4 mr-1" />
                                                        <span>
                                                            {campaign.goal.toFixed(
                                                                3
                                                            )}{" "}
                                                            {t`ETH`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </div>

                    <aside className="lg:relative">
                        <div className="lg:sticky lg:top-24 space-y-6">
                            <div className="bg-surface rounded-xl p-6 shadow-lg">
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center">
                                        <User className="w-8 h-8 text-primary" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-text">
                                            {profile.username}
                                        </h1>
                                        {profile.location && (
                                            <div className="flex items-center text-text-secondary mt-1">
                                                <MapPin className="w-4 h-4 mr-1" />
                                                <span>{profile.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {profile.bio && (
                                    <p className="text-text-secondary mb-6">
                                        {profile.bio}
                                    </p>
                                )}

                                <div className="flex flex-col gap-4">
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div className="bg-background rounded-lg p-3">
                                            <div className="text-xl font-bold text-text">
                                                {campaigns.length}
                                            </div>
                                            <div className="text-sm text-text-secondary">
                                                {t`Campaigns`}
                                            </div>
                                        </div>
                                        <div className="bg-background rounded-lg p-3">
                                            <div className="text-xl font-bold text-text">
                                                {campaigns
                                                    .reduce(
                                                        (sum, campaign) =>
                                                            sum +
                                                            (campaign.raised ||
                                                                0),
                                                        0
                                                    )
                                                    .toFixed(3)}
                                            </div>
                                            <div className="text-sm text-text-secondary">
                                                {t`ETH Raised`}
                                            </div>
                                        </div>
                                    </div>

                                    {user?.id !== profile.id && (
                                        <button
                                            onClick={() =>
                                                setIsContactModalOpen(true)
                                            }
                                            className="w-full py-2 border-2 border-primary rounded-lg text-primary hover:bg-primary hover:text-light transition-colors flex items-center justify-center">
                                            <MessageCircle className="w-4 h-4 mr-2" />
                                            {t`Contact`}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {profile && (
                <ContactModal
                    isOpen={isContactModalOpen}
                    onClose={() => setIsContactModalOpen(false)}
                    creatorName={profile.username}
                    creatorId={profile.id}
                    campaignId={null}
                />
            )}
        </div>
    );
}
