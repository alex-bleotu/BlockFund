import { t } from "@lingui/macro";
import { Compass } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { MobileDrawer } from "./MobileDrawer";
import { ProfileMenu } from "./ProfileMenu";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
    const { user } = useAuth();
    const location = useLocation();

    return (
        <nav className="fixed top-0 w-full bg-surface shadow-sm z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Logo />

                    <div className="hidden md:flex items-center">
                        <Link
                            to="/campaigns"
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                                location.pathname === "/campaigns"
                                    ? "text-primary bg-primary-light"
                                    : "text-text-secondary hover:text-primary hover:bg-primary-light/50"
                            }`}>
                            <Compass className="w-5 h-5" />
                            <span>{t`Explore`}</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center space-x-4">
                            <LanguageSwitcher />
                            <ThemeToggle />
                            {user ? (
                                <>
                                    <Link
                                        to="/campaign/new"
                                        className="px-4 py-2.5 text-sm font-medium text-light bg-primary rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
                                        {t`Start a Campaign`}
                                    </Link>
                                    <ProfileMenu />
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="px-4 py-2.5 text-sm font-medium text-light bg-primary rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
                                        {t`Login`}
                                    </Link>
                                </>
                            )}
                        </div>
                        <MobileDrawer />
                    </div>
                </div>
            </div>
        </nav>
    );
}
