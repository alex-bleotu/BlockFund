import { t } from "@lingui/core/macro";
import { motion } from "framer-motion";
import {
    AlertTriangle,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Info,
    MapPin,
    Tag,
    Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useEthPrice } from "../../../hooks/useEthPrice";
import { CampaignFormData } from "../../../lib/types";

interface PreviewStepProps {
    campaign: CampaignFormData;
    previewUrls: string[];
    onBack: () => void;
    onSubmit: () => void;
    loading: boolean;
    mode: "create" | "edit";
    error?: string | null;
}

export function PreviewStep({
    campaign,
    previewUrls,
    onBack,
    onSubmit,
    loading,
    mode,
    error: externalError,
}: PreviewStepProps) {
    const { user } = useAuth();
    const { ethPrice } = useEthPrice();
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        if (externalError) {
            if (
                externalError.includes("User denied transaction signature") ||
                externalError.includes("Transaction rejected")
            ) {
                setError(
                    t`Transaction declined: You cancelled the MetaMask transaction`
                );
            } else {
                setError(externalError);
            }
        }
    }, [externalError]);

    const handleSubmit = () => {
        if (!user) {
            setError(t`Please sign in to create a campaign`);
            return;
        }
        onSubmit();
    };

    const calculateProgress = (current: number, goal: number) => {
        return Math.min((current / goal) * 100, 100);
    };

    const handlePrevImage = () => {
        if (!previewUrls.length) return;
        setCurrentImageIndex((prev) =>
            prev === 0 ? previewUrls.length - 1 : prev - 1
        );
    };

    const handleNextImage = () => {
        if (!previewUrls.length) return;
        setCurrentImageIndex((prev) =>
            prev === previewUrls.length - 1 ? 0 : prev + 1
        );
    };

    const getNetworkDisplay = (network: string) => {
        switch (network) {
            case "local":
                return t`Local Development Network`;
            case "sepolia":
                return t`Sepolia Test Network`;
            case "mainnet":
                return t`Ethereum Mainnet`;
            default:
                return network;
        }
    };

    const getNetworkDisclaimerText = () => {
        if (mode === "create") {
            return t`This campaign will be deployed on the ${getNetworkDisplay(
                campaign.network || "sepolia"
            )}. It will not be visible or accessible from other networks. Make sure your wallet is connected to the correct network before proceeding.`;
        } else {
            return t`This campaign is deployed on the ${getNetworkDisplay(
                campaign.network || "sepolia"
            )}. Note that the network cannot be changed after campaign creation. Any edits you make will only affect the campaign metadata, not its blockchain configuration.`;
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-text">{t`Preview`}</h2>
                    <div className="space-x-4 flex">
                        <button
                            onClick={onBack}
                            className="px-4 py-2 text-text-secondary hover:text-text transition-colors">
                            {t`Back`}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="hidden sm:block px-6 py-2 bg-primary text-light rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
                            {loading
                                ? t`Saving...`
                                : mode === "create"
                                ? t`Launch Campaign`
                                : t`Save Changes`}
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex sm:hidden mt-2 w-full px-6 py-2 bg-primary items-center justify-center text-light rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
                    {loading
                        ? t`Saving...`
                        : mode === "create"
                        ? t`Launch Campaign`
                        : t`Save Changes`}
                </button>
            </div>

            {(error || externalError) && (
                <div className="p-4 bg-error/10 text-error rounded-lg flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>{error || externalError}</span>
                </div>
            )}

            <div className="p-4 bg-primary-light rounded-lg flex items-start">
                <Info className="w-5 h-5 mr-2 flex-shrink-0 text-primary mt-0.5" />
                <div>
                    <p className="font-medium text-primary mb-1">
                        {t`Network`}:{" "}
                        {getNetworkDisplay(campaign.network || "sepolia")}
                    </p>
                    <p className="text-sm text-text-secondary">
                        {getNetworkDisclaimerText()}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
                <div className="space-y-8">
                    <div className="relative rounded-xl overflow-hidden shadow-lg bg-surface">
                        {previewUrls.length > 0 ? (
                            <>
                                <div className="w-full aspect-video relative overflow-hidden">
                                    <motion.img
                                        key={currentImageIndex}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                        src={previewUrls[currentImageIndex]}
                                        alt={campaign.title}
                                        className="w-full h-[400px] object-fit"
                                    />
                                </div>
                                {previewUrls.length > 1 && (
                                    <>
                                        <button
                                            onClick={handlePrevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 transition-colors group">
                                            <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                        </button>
                                        <button
                                            onClick={handleNextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 transition-colors group">
                                            <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                        </button>
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                                            {previewUrls.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() =>
                                                        setCurrentImageIndex(
                                                            index
                                                        )
                                                    }
                                                    className={`w-2 h-2 rounded-full transition-all ${
                                                        currentImageIndex ===
                                                        index
                                                            ? "bg-primary scale-125"
                                                            : "bg-white/50 hover:bg-white/75"
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-[400px] bg-background-alt flex items-center justify-center text-text-secondary">
                                {t`No images uploaded`}
                            </div>
                        )}
                    </div>

                    <div className="bg-surface rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                                <Tag className="w-5 h-5 text-primary" />
                                <span className="text-text-secondary">
                                    {campaign.category}
                                </span>
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-text mb-4">
                            {campaign.title}
                        </h1>

                        <div className="mb-6">
                            <p className="text-lg text-text-secondary leading-relaxed">
                                {campaign.summary}
                            </p>
                        </div>

                        <div className="mb-6">
                            <div className="h-2 bg-background-alt rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${calculateProgress(
                                            0,
                                            parseFloat(campaign.goal)
                                        )}%`,
                                    }}
                                    transition={{ duration: 1 }}
                                    className="h-full bg-primary"
                                />
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <div>
                                    <div className="flex items-center">
                                        <img
                                            src="/eth.svg"
                                            alt="Ethereum"
                                            className="w-6 h-6 mr-1"
                                        />
                                        <div className="flex flex-row items-center gap-2 text-2xl font-bold text-text">
                                            0.00
                                            <span className="hidden sm:block">
                                                ETH
                                            </span>
                                        </div>
                                    </div>
                                    {ethPrice && (
                                        <div className="text-sm text-text-secondary">
                                            ≈ $0 USD
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-medium text-text">
                                        0%
                                    </div>
                                    <div className="text-sm text-text-secondary">
                                        {t`of`}{" "}
                                        {parseFloat(campaign.goal).toFixed(3)}{" "}
                                        ETH {t`goal`}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="prose prose-sm max-w-none text-text-secondary">
                            {campaign.description
                                .split("\n")
                                .map((paragraph, index) => (
                                    <p key={index} className="mb-4">
                                        {paragraph}
                                    </p>
                                ))}
                        </div>
                    </div>
                </div>

                <aside className="lg:relative">
                    <div className="lg:sticky lg:top-24 space-y-6">
                        <div className="bg-surface rounded-xl p-6 shadow-lg">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-text-secondary">
                                    <div className="flex items-center">
                                        <Calendar className="w-5 h-5 mr-2" />
                                        <span className="hidden sm:block">
                                            {t`Campaign End Date`}
                                        </span>
                                        <span className="block sm:hidden">
                                            {t`End Date`}
                                        </span>
                                    </div>
                                    <span>
                                        {new Date(campaign.deadline)
                                            .toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                            })
                                            .replace(/\//g, ".")}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center text-text">
                                    <Target className="w-5 h-5 mr-2 text-primary flex-shrink-0" />

                                    <span className="inline-flex items-center font-medium gap-2">
                                        {t`Goal:`}{" "}
                                        {parseFloat(campaign.goal).toFixed(3)}{" "}
                                        ETH
                                    </span>

                                    {ethPrice && (
                                        <span className="w-full sm:w-auto text-sm font-normal ml-2 mt-1 sm:mt-0">
                                            ≈ $
                                            {(
                                                parseFloat(campaign.goal) *
                                                ethPrice
                                            )
                                                .toFixed(0)
                                                .toLocaleString()}{" "}
                                            USD
                                        </span>
                                    )}
                                </div>

                                {campaign.location && (
                                    <div className="flex items-center text-text-secondary">
                                        <MapPin className="w-5 h-5 mr-2" />
                                        <span>{campaign.location}</span>
                                    </div>
                                )}

                                <div className="flex flex-col gap-1.5">
                                    <button
                                        disabled
                                        className="w-full py-3 rounded-lg bg-gray-400 cursor-not-allowed text-light/75">
                                        {t`Preview Mode`}
                                    </button>
                                    <p className="text-sm text-text-secondary text-center">
                                        {t`Support button will be enabled after campaign launch`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
