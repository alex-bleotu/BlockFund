import { t } from "@lingui/core/macro";
import { Award, Rocket, Shield, Users } from "lucide-react";

function ValueCard({
    icon: Icon,
    title,
    description,
}: {
    icon: any;
    title: string;
    description: string;
}) {
    return (
        <div className="flex flex-col items-center text-center p-6 bg-surface rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
            <p className="text-text-secondary">{description}</p>
        </div>
    );
}

export function About() {
    const values = [
        {
            icon: Shield,
            title: t`Educational Focus`,
            description: t`This project was created as a learning exercise to demonstrate the integration of blockchain technology with modern web development.`,
        },
        {
            icon: Users,
            title: t`Learning Experience`,
            description: t`A practical example of how blockchain can be used in crowdfunding, perfect for students and developers learning Web3 technologies.`,
        },
        {
            icon: Rocket,
            title: t`Technology Stack`,
            description: t`Built with React, TypeScript, Tailwind CSS, Supabase, and Ethereum smart contracts to showcase modern development practices.`,
        },
        {
            icon: Award,
            title: t`Open Source`,
            description: t`The project is open source, allowing others to learn from and contribute to the codebase.`,
        },
    ];

    return (
        <div className="min-h-screen bg-background pt-16">
            <div className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/20 animate-pulse"></div>
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 dark:opacity-5"></div>
                </div>
                <div className="relative py-24 sm:py-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl sm:text-5xl font-bold text-text mb-6">
                            {t`About BlockFund`}
                        </h1>
                        <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                            {t`BlockFund is a learning-focused initiative designed to illustrate how blockchain can enhance traditional crowdfunding platforms. Rather than serving as a live funding service, it's a practical example of how blockchain can be used in crowdfunding.`}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-text mb-4">
                        {t`Project Purpose`}
                    </h2>
                    <p className="text-xl text-text-secondary max-w-3xl mx-auto">
                        {t`The goal of BlockFund is to deliver a full-stack dApp where anyone can launch or back a fundraising campaign using MetaMask-enabled wallets. It showcases:`}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {values.map((value, index) => (
                        <ValueCard key={index} {...value} />
                    ))}
                </div>
            </div>
        </div>
    );
}
