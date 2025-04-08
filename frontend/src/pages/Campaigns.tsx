import { AnimatePresence, motion } from "framer-motion";
import {
    Calendar,
    Clock,
    Filter,
    MapPin,
    Rocket,
    Search,
    Tag,
    Target,
    TrendingUp,
    Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEthPrice } from "../hooks/useEthPrice";
import { supabase } from "../lib/supabase";
import { Campaign, CAMPAIGN_CATEGORIES } from "../lib/types";

export function Campaigns() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { ethPrice } = useEthPrice();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCampaigns();
    }, []);

    useEffect(() => {
        filterCampaigns();
    }, [selectedCategory, searchQuery, campaigns]);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("campaigns")
                .select("*")
                .eq("status", "active")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setCampaigns(data || []);
        } catch (err) {
            console.error("Error fetching campaigns:", err);
            setError("Failed to load campaigns");
        } finally {
            setLoading(false);
        }
    };

    const filterCampaigns = () => {
        let filtered = [...campaigns];

        if (selectedCategory !== "all") {
            filtered = filtered.filter(
                (campaign) => campaign.category === selectedCategory
            );
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (campaign) =>
                    campaign.title.toLowerCase().includes(query) ||
                    campaign.summary.toLowerCase().includes(query)
            );
        }

        setFilteredCampaigns(filtered);
    };

    const calculateProgress = (current: number, goal: number) => {
        return Math.min((current / goal) * 100, 100);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} days left`;
    };

    const stats = [
        {
            icon: TrendingUp,
            value: campaigns
                .reduce((acc, curr) => acc + curr.current_amount, 0)
                .toFixed(2),
            label: "ETH Raised",
            color: "text-primary",
        },
        {
            icon: Users,
            value: campaigns.length,
            label: "Active Campaigns",
            color: "text-success",
        },
        {
            icon: Clock,
            value: campaigns.filter((c) => new Date(c.deadline) > new Date())
                .length,
            label: "Ending Soon",
            color: "text-error",
        },
    ];

    return (
        <div className="min-h-screen bg-background pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-surface rounded-xl p-6 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-text mb-1">
                                        {stat.value}
                                    </p>
                                    <p className="text-text-secondary">
                                        {stat.label}
                                    </p>
                                </div>
                                <div
                                    className={`w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search campaigns..."
                                className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text"
                            />
                        </div>
                        <div className="md:hidden block relative min-w-[200px]">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                            <select
                                value={selectedCategory}
                                onChange={(e) =>
                                    setSelectedCategory(e.target.value)
                                }
                                className="w-full pl-10 pr-8 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text appearance-none cursor-pointer">
                                <option value="all">All Categories</option>
                                {CAMPAIGN_CATEGORIES.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="hidden md:flex mt-4 flex-wrap gap-4">
                        {["all", ...CAMPAIGN_CATEGORIES].map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    selectedCategory === category
                                        ? "bg-primary text-light"
                                        : "bg-background text-text-secondary hover:bg-primary-light hover:text-primary"
                                }`}>
                                {category === "all" ? "All" : category}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center items-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : error ? (
                    <div className="text-center text-error">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredCampaigns.map((campaign, index) => (
                                <motion.div
                                    key={campaign.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
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
                                            <div className="flex items-center space-x-2 text-light text-sm">
                                                <Tag className="w-4 h-4" />
                                                <span>{campaign.category}</span>
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
                                                            campaign.current_amount,
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
                                                    {campaign.current_amount.toFixed(
                                                        2
                                                    )}{" "}
                                                    ETH raised
                                                </span>
                                                <span className="text-text font-medium">
                                                    {(
                                                        (campaign.current_amount /
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
                                                        campaign.current_amount *
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
                                                        <span>
                                                            {campaign.location}
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
                                                {campaign.goal.toFixed(2)} ETH
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-16 text-center">
                    <button
                        onClick={() => navigate("/fund/new")}
                        className="inline-flex items-center px-8 py-4 bg-primary text-light rounded-xl hover:bg-primary-dark transition-colors group shadow-lg hover:shadow-xl">
                        <Rocket className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                        Start Your Campaign
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
