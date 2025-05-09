import { t } from "@lingui/core/macro";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCampaignContract } from "../../hooks/useCampaignContract";
import { useMetaMask } from "../../hooks/useMetaMask";
import { useWallet } from "../../hooks/useWallet";
import { supabase } from "../../lib/supabase";
import { CampaignCategories } from "../../lib/types";
import { getCampaignCategory } from "../../lib/utils";
import { FundingInput } from "./components/FundingInput";
import { ImageUpload } from "./components/ImageUpload";
import { PreviewStep } from "./components/PreviewStep";
import { StepIndicator } from "./components/StepIndicator";
import { launchCampaign } from "./utils/launchCampaign";

interface FormData {
    title: string;
    category: string;
    goal: string;
    usdAmount: string;
    summary: string;
    description: string;
    location: string;
    deadline: string;
    images: File[];
    network: "local" | "sepolia" | "mainnet";
}

declare global {
    interface Window {
        ethereum?: any;
    }
}

export function NewFund() {
    const { createCampaign } = useCampaignContract();
    const { user } = useAuth();
    const { address } = useWallet();
    const { connect } = useMetaMask();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [hasMetaMask, setHasMetaMask] = useState<boolean>(false);
    const hasConnected = useRef(false);
    const [formData, setFormData] = useState<FormData>({
        title: "",
        category: "",
        goal: "",
        usdAmount: "",
        summary: "",
        description: "",
        location: "",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        images: [],
        network: "local",
    });

    const titleLength = useMemo(() => formData.title.length, [formData.title]);
    const summaryLength = useMemo(
        () => formData.summary.length,
        [formData.summary]
    );
    const descriptionLength = useMemo(
        () => formData.description.length,
        [formData.description]
    );
    const locationLength = useMemo(
        () => formData.location.length,
        [formData.location]
    );

    const TITLE_CHAR_LIMIT = 50;
    const SUMMARY_CHAR_LIMIT = 200;
    const DESCRIPTION_CHAR_LIMIT = 1000;
    const LOCATION_CHAR_LIMIT = 50;

    const twoYearsFromNow = useMemo(() => {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 2);
        return date.toISOString().split("T")[0];
    }, []);

    useEffect(() => {
        if (!user) {
            navigate("/login", { state: { from: "/campaign/new" } });
            return;
        }
    }, [user, navigate]);

    useEffect(() => {
        const checkMetaMask = () => {
            setHasMetaMask(!!window.ethereum);
        };
        checkMetaMask();

        const savedNetwork = localStorage.getItem("NETWORK") || "local";
        setFormData((prev) => ({
            ...prev,
            network: savedNetwork as "local" | "sepolia" | "mainnet",
        }));
    }, []);

    useEffect(() => {
        const connectWallet = async () => {
            if (hasConnected.current) return;
            hasConnected.current = true;

            await connect();
        };

        connectWallet();
    }, [connect]);

    const completionScore = useMemo(() => {
        const requiredFields = {
            title: formData.title.length > 0,
            category: formData.category.length > 0,
            goal: parseFloat(formData.goal) > 0,
            summary: formData.summary.length > 0,
            description: formData.description.length > 0,
            images: formData.images.length > 0,
        };

        const completedFields =
            Object.values(requiredFields).filter(Boolean).length;
        return Math.round(
            (completedFields / Object.keys(requiredFields).length) * 100
        );
    }, [formData]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        if (name === "deadline") {
            const oneWeekFromNow = new Date();
            oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
            const minDate = oneWeekFromNow.toISOString().split("T")[0];

            if (value < minDate) {
                setError(
                    t`Campaign deadline must be at least 1 week from today`
                );
                return;
            } else if (value > twoYearsFromNow) {
                setError(
                    t`Campaign deadline cannot be more than 2 years in the future`
                );
                return;
            } else {
                setError(null);
            }
        }

        if (name === "title" && value.length > TITLE_CHAR_LIMIT) {
            setError(
                t`Title is limited to` +
                    " " +
                    TITLE_CHAR_LIMIT +
                    " " +
                    t`characters`
            );
            return;
        } else if (name === "summary" && value.length > SUMMARY_CHAR_LIMIT) {
            setError(
                t`Summary is limited to` +
                    " " +
                    SUMMARY_CHAR_LIMIT +
                    " " +
                    t`characters`
            );
            return;
        } else if (
            name === "description" &&
            value.length > DESCRIPTION_CHAR_LIMIT
        ) {
            setError(
                t`Description is limited to` +
                    " " +
                    DESCRIPTION_CHAR_LIMIT +
                    " " +
                    t`characters`
            );
            return;
        } else if (name === "location" && value.length > LOCATION_CHAR_LIMIT) {
            setError(
                t`Location is limited to` +
                    " " +
                    LOCATION_CHAR_LIMIT +
                    " " +
                    t`characters`
            );
            return;
        } else {
            setError(null);
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleGoalChange = (value: string) => {
        setError(null);
        setFormData((prev) => ({ ...prev, goal: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setFormData((prev) => ({
                ...prev,
                images: [...prev.images, ...files],
            }));

            const newPreviewUrls = files.map((file) =>
                URL.createObjectURL(file)
            );
            setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
        }
    };

    const removeImage = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));

        URL.revokeObjectURL(previewUrls[index]);
        setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!user) {
            setError("Please sign in to create a campaign");
            return;
        }

        if (completionScore < 100) {
            setError(
                "Please complete all required fields before launching the campaign"
            );
            return;
        }

        if (!address) {
            setError("Please connect your wallet to create a campaign");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const trimmedFormData = {
                ...formData,
                title: formData.title.trim(),
                summary: formData.summary.trim(),
                description: formData.description.trim(),
                location: formData.location.trim(),
            };

            const paths: string[] = await Promise.all(
                trimmedFormData.images.map(async (file) => {
                    const fileName = `${user.id}/${Date.now()}-${file.name}`;
                    const { data, error } = await supabase.storage
                        .from("campaign-images")
                        .upload(fileName, file);
                    if (error) throw error;
                    return data.path;
                })
            );

            const imageUrls: string[] = paths.map((path) => {
                const {
                    data: { publicUrl },
                } = supabase.storage.from("campaign-images").getPublicUrl(path);
                return publicUrl;
            });

            const {
                supabaseData,
                onChainTx,
                error: launchError,
            } = await launchCampaign(
                {
                    ...trimmedFormData,
                    goal: parseFloat(trimmedFormData.goal || "0"),
                    images: imageUrls,
                },
                user.id,
                createCampaign
            );

            if (onChainTx.status === "reverted")
                throw new Error("Campaign creation on chain failed");
            if (launchError) throw launchError;
            if (!supabaseData) throw new Error("Failed to create campaign");
            navigate(`/campaign/${supabaseData.id}`);
        } catch (err: any) {
            console.error("Error creating campaign:", err);
            if (
                err.code === 4001 ||
                (err.error && err.error.code === 4001) ||
                (err.message &&
                    err.message.includes("User denied transaction signature"))
            ) {
                setError(
                    t`Transaction rejected: You declined the MetaMask transaction`
                );
            } else if (
                err.message &&
                err.message.includes("Cannot read properties of null ")
            ) {
                setError(t`Something went wrong. Please try again.`);
            } else {
                setError(err.message || t`Failed to create campaign`);
            }
        } finally {
            setLoading(false);
        }
    };

    const setStep = (step: number) => {
        if (step >= 1 && step <= 4) {
            setCurrentStep(step);
        }
    };

    const nextStep = () => {
        if (currentStep < 4) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleCategorySelect = (category: string) => {
        setFormData((prev) => ({ ...prev, category }));
    };

    const handleBack = () => {
        navigate(-1);
    };

    const renderMetaMaskRequired = () => (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="max-w-md w-full mx-auto px-4 py-8">
                <div className="bg-surface rounded-xl shadow-lg p-8 text-center">
                    <div className="text-6xl mb-4">🦊</div>
                    <h1 className="text-2xl font-bold text-text mb-4">
                        {t`MetaMask Required`}
                    </h1>
                    <p className="text-text-secondary mb-6">
                        {t`To create a campaign, you need to have MetaMask installed in your browser. MetaMask allows you to securely manage your cryptocurrency and interact with blockchain applications.`}
                    </p>
                    <a
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full px-6 py-3 bg-primary text-light rounded-lg hover:bg-primary-dark transition-colors mb-4">
                        {t`Install MetaMask`}
                    </a>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full px-6 py-3 bg-background text-text-secondary rounded-lg hover:bg-background-alt transition-colors">
                        {t`Go Back`}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderConnectWallet = () => (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="max-w-md w-full mx-auto px-4 py-8">
                <div className="bg-surface rounded-xl shadow-lg p-8 text-center">
                    <div className="text-6xl mb-4">🔑</div>
                    <h1 className="text-2xl font-bold text-text mb-4">
                        {t`Connect Your Wallet`}
                    </h1>
                    <p className="text-text-secondary mb-6">
                        {t`You need to connect your wallet to create a new campaign. This allows you to receive funds and manage your campaign securely.`}
                    </p>
                    <button
                        onClick={() => navigate("/settings?tab=wallet")}
                        className="w-full px-6 py-3 bg-primary text-light rounded-lg hover:bg-primary-dark transition-colors mb-4">
                        {t`Connect Wallet`}
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full px-6 py-3 bg-background text-text-secondary rounded-lg hover:bg-background-alt transition-colors">
                        {t`Go Back`}
                    </button>
                </div>
            </div>
        </div>
    );

    if (!hasMetaMask) {
        return renderMetaMaskRequired();
    }

    if (!address) {
        return renderConnectWallet();
    }

    if (currentStep === 4) {
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-surface rounded-xl shadow-lg p-6 md:p-8">
                        <PreviewStep
                            campaign={{
                                ...formData,
                                images: previewUrls,
                            }}
                            previewUrls={previewUrls}
                            onBack={prevStep}
                            onSubmit={handleSubmit}
                            loading={loading}
                            mode="create"
                            error={error}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button
                    onClick={handleBack}
                    className="flex items-center text-text-secondary hover:text-text mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    {t`Back`}
                </button>

                <div className="bg-surface rounded-xl shadow-lg p-6 md:p-8">
                    <div className="sm:flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-text">
                            {t`Create Your Campaign`}
                        </h1>
                        <div className="text-sm text-text-secondary mt-2 sm:mt-0">
                            {t`Completion:`}{" "}
                            <span className="font-bold text-primary">
                                {completionScore}%
                            </span>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-error-light text-error rounded-lg">
                            {error}
                        </div>
                    )}

                    <StepIndicator
                        currentStep={currentStep}
                        onStepClick={setStep}
                    />

                    <form className="space-y-6">
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <label
                                        htmlFor="title"
                                        className="block text-sm font-medium text-text mb-2">
                                        {t`Campaign Title`} *
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        required
                                        maxLength={TITLE_CHAR_LIMIT}
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text"
                                        placeholder={t`Give your campaign a catchy title`}
                                    />
                                    <div className="flex justify-end mt-1">
                                        <span
                                            className={`text-xs ${
                                                titleLength >= TITLE_CHAR_LIMIT
                                                    ? "text-error"
                                                    : "text-text-secondary"
                                            }`}>
                                            {titleLength}/{TITLE_CHAR_LIMIT}{" "}
                                            {t`characters`}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text mb-3">
                                        {t`Category`} *
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                        {CampaignCategories.map((category) => (
                                            <button
                                                key={category}
                                                type="button"
                                                onClick={() =>
                                                    handleCategorySelect(
                                                        category
                                                    )
                                                }
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                    formData.category ===
                                                    category
                                                        ? "bg-primary text-light scale-105"
                                                        : "bg-background-alt text-text-secondary hover:bg-primary/10 hover:text-primary"
                                                }`}>
                                                {getCampaignCategory(category)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <FundingInput
                                    value={formData.goal}
                                    onChange={handleGoalChange}
                                    initialUsdAmount={formData.usdAmount}
                                />

                                <div>
                                    <label
                                        htmlFor="deadline"
                                        className="block text-sm font-medium text-text mb-2">
                                        {t`End Date`}
                                    </label>
                                    <input
                                        type="date"
                                        id="deadline"
                                        name="deadline"
                                        value={formData.deadline}
                                        onChange={handleChange}
                                        min={
                                            new Date(
                                                Date.now() +
                                                    7 * 24 * 60 * 60 * 1000
                                            )
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        max={twoYearsFromNow}
                                        className="appearance-none block w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text"
                                    />
                                    <p className="text-xs text-text-secondary mt-1">
                                        {t`Campaign must run for at least 1 week from today and no more than 2 years`}
                                    </p>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <label
                                        htmlFor="summary"
                                        className="block text-sm font-medium text-text mb-2">
                                        {t`Summary`} *
                                    </label>
                                    <textarea
                                        id="summary"
                                        name="summary"
                                        required
                                        rows={3}
                                        maxLength={SUMMARY_CHAR_LIMIT}
                                        value={formData.summary}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text"
                                        placeholder={t`Write a brief summary of your campaign`}
                                    />
                                    <div className="flex justify-end mt-1">
                                        <span
                                            className={`text-xs ${
                                                summaryLength >=
                                                SUMMARY_CHAR_LIMIT
                                                    ? "text-error"
                                                    : "text-text-secondary"
                                            }`}>
                                            {summaryLength}/{SUMMARY_CHAR_LIMIT}{" "}
                                            {t`characters`}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="description"
                                        className="block text-sm font-medium text-text mb-2">
                                        {t`Full Description`} *
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        required
                                        rows={6}
                                        maxLength={DESCRIPTION_CHAR_LIMIT}
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text"
                                        placeholder={t`Provide detailed information about your campaign`}
                                    />
                                    <div className="flex justify-end mt-1">
                                        <span
                                            className={`text-xs ${
                                                descriptionLength >=
                                                DESCRIPTION_CHAR_LIMIT
                                                    ? "text-error"
                                                    : "text-text-secondary"
                                            }`}>
                                            {descriptionLength}/
                                            {DESCRIPTION_CHAR_LIMIT}{" "}
                                            {t`characters`}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="location"
                                        className="block text-sm font-medium text-text mb-2">
                                        {t`Location`}
                                    </label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        value={formData.location}
                                        maxLength={LOCATION_CHAR_LIMIT}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text"
                                        placeholder={t`Where is your campaign based?`}
                                    />
                                    <div className="flex justify-end mt-1">
                                        <span
                                            className={`text-xs ${
                                                locationLength >=
                                                LOCATION_CHAR_LIMIT
                                                    ? "text-error"
                                                    : "text-text-secondary"
                                            }`}>
                                            {locationLength}/
                                            {LOCATION_CHAR_LIMIT}{" "}
                                            {t`characters`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <ImageUpload
                                previewUrls={previewUrls}
                                onImageChange={handleImageChange}
                                onRemoveImage={removeImage}
                            />
                        )}

                        <div className="flex justify-between pt-6">
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-6 py-2 text-text-secondary hover:text-text transition-colors">
                                    {t`Back`}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={nextStep}
                                disabled={
                                    currentStep === 3 && completionScore < 100
                                }
                                className={`ml-auto px-6 py-2 rounded-lg transition-colors ${
                                    currentStep === 3 && completionScore < 100
                                        ? "bg-primary/50 text-light/50 cursor-not-allowed"
                                        : "bg-primary text-light hover:bg-primary-dark"
                                }`}>
                                {currentStep === 3 ? t`Preview` : t`Next Step`}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
