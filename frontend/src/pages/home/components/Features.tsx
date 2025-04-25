import { t } from "@lingui/core/macro";
import { Globe, Heart, Rocket, Shield, Users, Zap } from "lucide-react";

interface FeatureCardProps {
    icon: any;
    title: string;
    description: string;
    delay: string;
}

function FeatureCard({
    icon: Icon,
    title,
    description,
    delay,
}: FeatureCardProps) {
    return (
        <div
            className="bg-surface rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
            style={{ animation: `fadeInUp 0.6s ease-out ${delay} backwards` }}>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text mb-2">{title}</h3>
            <p className="text-text-secondary">{description}</p>
        </div>
    );
}

export function Features() {
    const features = [
        {
            id: "security",
            icon: Shield,
            title: t`Secure & Transparent`,
            description: t`Every transaction is recorded on the blockchain, ensuring complete transparency and security for all participants.`,
        },
        {
            id: "smart-contracts",
            icon: Zap,
            title: t`Smart Contracts`,
            description: t`Automated fund distribution and milestone tracking through smart contracts, eliminating intermediaries.`,
        },
        {
            id: "community",
            icon: Users,
            title: t`Global Community`,
            description: t`Connect with backers and creators from around the world in our vibrant ecosystem.`,
        },
        {
            id: "global",
            icon: Globe,
            title: t`Worldwide Access`,
            description: t`Access funding opportunities from anywhere in the world, breaking down geographical barriers.`,
        },
        {
            id: "impact",
            icon: Heart,
            title: t`Social Impact`,
            description: t`Make a real difference by supporting projects that matter to you and your community.`,
        },
        {
            id: "innovation",
            icon: Rocket,
            title: t`Innovation First`,
            description: t`Stay ahead with cutting-edge blockchain technology and innovative funding solutions.`,
        },
    ];

    return (
        <div className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-text mb-4">
                        {t`Why Choose BlockFund?`}
                    </h2>
                    <p className="text-xl text-text-secondary">
                        {t`Experience the next generation of crowdfunding`}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={feature.id}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                            delay={`${index * 0.1}s`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
