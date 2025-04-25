import { motion } from "framer-motion";
import { Calendar, MapPin, Tag, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEthPrice } from "../../../hooks/useEthPrice";
import { supabase } from "../../../lib/supabase";
import { Campaign } from "../../../lib/types";

export function TopCampaigns() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const { ethPrice } = useEthPrice();
    const navigate = useNavigate();

    useEffect(() => {
        fetchTopCampaigns();
    }, []);

    const fetchTopCampaigns = async () => {
        try {
            const now = new Date().toISOString();
            const { data, error } = await supabase
                .from("campaigns")
                .select("*")
                .eq("status", "active")
                .gt("deadline", now)
                .order("raised", { ascending: false })
                .limit(3);

            if (error) throw error;
            setCampaigns(data || []);
        } catch (err) {
            console.error("Error fetching top campaigns:", err);
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
        return diffDays > 0 ? `${diffDays} days left` : "Ended";
    };

    if (loading) {
        return (
            <div className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse space-y-8">
                        <div className="h-8 w-64 bg-surface rounded-lg"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="bg-surface rounded-xl h-96"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (campaigns.length === 0) {
        return null;
    }

    return (
        <div className="py-16 bg-background-alt">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-text mb-8">
                    Top Active Campaigns
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {campaigns.map((campaign, index) => (
                        <motion.div
                            key={campaign.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-surface rounded-xl shadow-lg overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300"
                            onClick={() =>
                                navigate(`/campaign/${campaign.id}`)
                            }>
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={
                                        campaign.images[0] ||
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
                                            <span>{campaign.category}</span>
                                        </div>
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
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${calculateProgress(
                                                    campaign.raised || 0,
                                                    campaign.goal
                                                )}%`,
                                            }}
                                            transition={{
                                                duration: 1,
                                                delay: index * 0.1,
                                            }}
                                            className="h-full bg-primary"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mt-2 text-sm">
                                        <span className="text-text-secondary">
                                            {(campaign.raised || 0).toFixed(2)}{" "}
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

                                <div className="flex items-center justify-between text-sm text-text-secondary">
                                    <div className="flex items-center space-x-4">
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
                                </div>

                                <div className="flex items-center text-primary font-medium mt-4">
                                    <Target className="w-4 h-4 mr-1" />
                                    <span>{campaign.goal.toFixed(2)} ETH</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
