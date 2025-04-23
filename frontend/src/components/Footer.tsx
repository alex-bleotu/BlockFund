import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-4">
                            Quick Links
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/about"
                                    className="text-text-secondary hover:text-primary transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contact"
                                    className="text-text-secondary hover:text-primary transition-colors">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/campaign/new"
                                    className="text-text-secondary hover:text-primary transition-colors">
                                    Start a Fund
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-4">
                            Resources
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#"
                                    className="text-text-secondary hover:text-primary transition-colors">
                                    Documentation
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-text-secondary hover:text-primary transition-colors">
                                    FAQs
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-text-secondary hover:text-primary transition-colors">
                                    Blog
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-4">
                            Connect With Us
                        </h3>
                        <div className="flex space-x-4">
                            <a
                                href="#"
                                className="text-text-secondary hover:text-primary transition-colors">
                                <Github className="h-5 w-5" />
                            </a>
                            <a
                                href="#"
                                className="text-text-secondary hover:text-primary transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a
                                href="#"
                                className="text-text-secondary hover:text-primary transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a
                                href="#"
                                className="text-text-secondary hover:text-primary transition-colors">
                                <Mail className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-border">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-text-secondary text-sm">
                            © {currentYear} BlockFund. All rights reserved.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a
                                href="#"
                                className="text-text-secondary hover:text-primary text-sm transition-colors">
                                Privacy Policy
                            </a>
                            <a
                                href="#"
                                className="text-text-secondary hover:text-primary text-sm transition-colors">
                                Terms of Service
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
