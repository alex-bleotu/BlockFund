import { t } from "@lingui/core/macro";
import { Shield, Sparkles, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useEthPrice } from "../../../hooks/useEthPrice";
import { supabase } from "../../../lib/supabase";

interface StatCardProps {
    icon: any;
    label: string;
    value: string;
    prefix?: string;
    suffix?: string;
    delay: string;
    duration?: number;
}

function AnimatedCounter({
    value,
    prefix = "",
    suffix = "",
    duration = 2000,
}: {
    value: string;
    prefix?: string;
    suffix?: string;
    duration?: number;
}) {
    const [count, setCount] = useState(0);
    const finalValue = parseInt(value.replace(/[^0-9]/g, ""));

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const updateCount = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);

            setCount(Math.floor(percentage * finalValue));

            if (percentage < 1) {
                animationFrame = requestAnimationFrame(updateCount);
            }
        };

        animationFrame = requestAnimationFrame(updateCount);
        return () => cancelAnimationFrame(animationFrame);
    }, [finalValue, duration]);

    return (
        <span>
            {prefix}
            {count.toLocaleString()}
            {suffix}
        </span>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
    prefix = "",
    suffix = "",
    delay,
    duration = 2000,
}: StatCardProps) {
    return (
        <div
            className="bg-surface rounded-xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300"
            style={{ animation: `fadeInUp 0.6s ease-out ${delay} backwards` }}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-text-secondary">{label}</p>
                    <p className="text-2xl font-bold text-text mt-2 count-up">
                        <AnimatedCounter
                            value={value}
                            prefix={prefix}
                            suffix={suffix}
                            duration={duration}
                        />
                    </p>
                </div>
                <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                </div>
            </div>
        </div>
    );
}

export function Stats() {
    const { ethPrice } = useEthPrice();
    const [statsData, setStatsData] = useState({
        activeUsers: "0",
        totalRaised: "0",
        totalProjects: "0",
        successRate: "0",
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            try {
                const { count: usersCount, error: usersError } = await supabase
                    .from("profiles")
                    .select("*", { count: "exact", head: true })
                    .not("wallet_address", "is", null);

                if (usersError) throw usersError;

                const { data: campaignsData, error: campaignsError } =
                    await supabase.from("campaigns").select("raised");

                if (campaignsError) throw campaignsError;

                const totalRaisedEth = campaignsData.reduce(
                    (sum, campaign) => sum + (parseFloat(campaign.raised) || 0),
                    0
                );

                const totalRaisedUsd = ethPrice
                    ? totalRaisedEth * ethPrice
                    : totalRaisedEth * 2500;

                const { count: projectsCount, error: projectsError } =
                    await supabase
                        .from("campaigns")
                        .select("*", { count: "exact", head: true });

                if (projectsError) throw projectsError;

                const { count: successfulCount, error: successError } =
                    await supabase
                        .from("campaigns")
                        .select("*", { count: "exact", head: true })
                        .eq("status", "SUCCESSFUL");

                if (successError) throw successError;

                const successRate =
                    projectsCount && projectsCount > 0
                        ? Math.round(
                              ((successfulCount || 0) / projectsCount) * 100
                          )
                        : 0;

                setStatsData({
                    activeUsers: String(usersCount || 0),
                    totalRaised: String(Math.round(totalRaisedUsd)),
                    totalProjects: String(projectsCount || 0),
                    successRate: String(successRate),
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [ethPrice]);

    const stats = [
        {
            id: "users",
            icon: Users,
            label: t`Active Users`,
            value: isLoading ? "0" : statsData.activeUsers,
            suffix: "+",
            increment: 1,
            duration: 2000,
        },
        {
            id: "funds",
            icon: TrendingUp,
            label: t`Total Raised`,
            value: isLoading ? "0" : statsData.totalRaised,
            prefix: "$",
            increment: 10000,
            duration: 2500,
        },
        {
            id: "projects",
            icon: Shield,
            label: t`Secure Projects`,
            value: isLoading ? "0" : statsData.totalProjects,
            suffix: "+",
            increment: 1,
            duration: 2000,
        },
        {
            id: "success",
            icon: Sparkles,
            label: t`Success Rate`,
            value: isLoading ? "0" : statsData.successRate,
            suffix: "%",
            increment: 1,
            duration: 1500,
        },
    ];

    return (
        <div className="py-16 bg-background-alt">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <StatCard
                            key={stat.id}
                            icon={stat.icon}
                            label={stat.label}
                            value={stat.value}
                            prefix={stat.prefix}
                            suffix={stat.suffix}
                            delay={`${index * 0.1}s`}
                            duration={stat.duration}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
