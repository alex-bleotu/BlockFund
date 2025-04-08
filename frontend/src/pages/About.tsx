import { Award, Rocket, Shield, Users } from "lucide-react";

function TeamMember({
    name,
    role,
    image,
}: {
    name: string;
    role: string;
    image: string;
}) {
    return (
        <div className="text-center">
            <img
                src={image}
                alt={name}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="text-lg font-semibold text-text">{name}</h3>
            <p className="text-text-secondary">{role}</p>
        </div>
    );
}

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
            title: "Trust & Security",
            description:
                "We prioritize the security of our platform and the trust of our community above all else.",
        },
        {
            icon: Users,
            title: "Community First",
            description:
                "Our decisions are guided by what's best for our diverse and growing community.",
        },
        {
            icon: Rocket,
            title: "Innovation",
            description:
                "We continuously push the boundaries of what's possible in crowdfunding.",
        },
        {
            icon: Award,
            title: "Excellence",
            description:
                "We strive for excellence in everything we do, from code to customer service.",
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
                            About BlockFund
                        </h1>
                        <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                            We're revolutionizing crowdfunding through
                            blockchain technology, making it more transparent,
                            secure, and accessible for everyone.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-text mb-4">
                        Our Mission
                    </h2>
                    <p className="text-xl text-text-secondary max-w-3xl mx-auto">
                        To democratize fundraising by leveraging blockchain
                        technology, creating a transparent and efficient
                        platform that connects innovators with supporters
                        worldwide.
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
