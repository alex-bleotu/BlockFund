import { t } from "@lingui/macro";
import { ArrowLeft, Rocket } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="flex justify-center">
                    <div className="w-24 h-24 relative">
                        <div className="absolute inset-0 bg-primary-light rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Rocket className="w-12 h-12 text-primary transform rotate-45" />
                        </div>
                    </div>
                </div>

                <h1 className="text-9xl font-bold text-primary">404</h1>
                <h2 className="text-2xl font-bold text-text">{t`Page Not Found`}</h2>
                <p className="text-text-secondary">
                    {t`The page you are looking for doesn't exist or has been moved.`}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center px-6 py-3 border-2 border-primary rounded-xl text-primary hover:bg-primary hover:text-light transition-colors w-full sm:w-auto">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        {t`Go Back`}
                    </button>

                    <Link
                        to="/"
                        className="flex items-center justify-center px-6 py-3 bg-primary text-light rounded-xl hover:bg-primary-dark transition-colors w-full sm:w-auto">
                        {t`Go Home`}
                        <Rocket className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
