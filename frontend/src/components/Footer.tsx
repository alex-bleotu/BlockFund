import { t } from "@lingui/core/macro";
import { Github, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-4">
                            {t`Quick Links`}
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/about"
                                    className="text-text-secondary hover:text-primary transition-colors">
                                    {t`About`}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contact"
                                    className="text-text-secondary hover:text-primary transition-colors">
                                    {t`Contact`}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/campaign/new"
                                    className="text-text-secondary hover:text-primary transition-colors">
                                    {t`Start a Campaign`}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-4">
                            {t`Resources`}
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="https://docs.google.com/viewer?url=https://raw.githubusercontent.com/alex-bleotu/BlockFund/ce73682a2bbbfd7847d1a404382d04495c5c3c8e/documentation/BlockFund.pdf"
                                    target="_blank"
                                    className="text-text-secondary hover:text-primary transition-colors">
                                    {t`Documentation`}
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/faqs"
                                    className="text-text-secondary hover:text-primary transition-colors">
                                    {t`FAQs`}
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-4">
                            {t`Connect With Us`}
                        </h3>
                        <div className="flex space-x-4">
                            <a
                                href="https://github.com/alex-bleotu/BlockFund"
                                className="text-text-secondary hover:text-primary transition-colors">
                                <Github className="h-5 w-5" />
                            </a>
                            <a
                                href="https://www.linkedin.com/in/alexbleotu"
                                className="text-text-secondary hover:text-primary transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a
                                href="mailto:alexbleotu2006@gmail.com"
                                className="text-text-secondary hover:text-primary transition-colors">
                                <Mail className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-border">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-text-secondary text-sm">
                            © {currentYear} {t`BlockFund. All rights reserved.`}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
