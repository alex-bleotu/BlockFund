import { t } from "@lingui/core/macro";
import { ChevronRight, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

export function Hero() {
    const { user } = useAuth();

    return (
        <div className="pt-20 pb-16 text-center lg:pt-32 relative overflow-hidden px-4 sm:px-6 lg:px-8">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/10 animate-pulse"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-5"></div>
            </div>
            <div className="relative z-10 max-w-3xl mx-auto">
                <h1 className="mt-8 lg:mt-0 text-4xl sm:text-5xl lg:text-6xl font-bold text-text mb-6 max-w-2xl mx-auto">
                    {t`Revolutionize Your`}{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark">
                        {t`Crowdfunding`}
                    </span>{" "}
                    {t`Journey`}
                </h1>
                <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                    {t`Join the future of fundraising with blockchain technology. Transparent, secure, and efficient crowdfunding for the digital age.`}
                </p>
                {!user && (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            to="/register"
                            className="w-full sm:w-auto group px-8 py-3 text-light font-medium bg-primary rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                            {t`Launch Your Campaign`}
                            <Rocket className="ml-2 w-5 h-5 inline-block group-hover:rotate-12 transition-transform" />
                        </Link>
                        <Link
                            to="/about"
                            className="w-full sm:w-auto px-8 py-3 text-text dark:text-light hover:text-primary hover:dark:text-primary font-medium  border-2 border-text/20 hover:border-primary rounded-xl transition-colors duration-200">
                            {t`Learn More`}
                            <ChevronRight className="ml-2 w-5 h-5 inline-block" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
