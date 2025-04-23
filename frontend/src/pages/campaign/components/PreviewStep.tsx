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
}

export function PreviewStep({
    campaign,
    previewUrls,
    onBack,
    onSubmit,
    loading,
    mode,
}: PreviewStepProps) {
    const { user } = useAuth();
    const { ethPrice } = useEthPrice();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleSubmit = () => {
        if (!user) {
            setError("Please sign in to create a campaign");
            return;
        }
        onSubmit();
    };

    const ethAmount = parseFloat(String(campaign.goal || "0"));
    const usdAmount = ethPrice ? ethAmount * ethPrice : 0;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
            formatted: date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
            daysLeft: diffDays,
        };
    };

    const campaignEndDate = campaign.deadline
        ? formatDate(campaign.deadline)
        : null;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-text">Preview</h2>
                <div className="space-x-4">
                    <button
                        onClick={onBack}
                        className="px-4 py-2 text-text-secondary hover:text-text transition-colors">
                        Back
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-primary text-light rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
                        {loading
                            ? "Saving..."
                            : mode === "create"
                            ? "Launch Campaign"
                            : "Save Changes"}
                    </button>
                </div>
            </div>

            <div className="bg-background rounded-lg p-6">
                <h1 className="text-3xl font-bold text-text mb-4">
                    {campaign.title}
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        {previewUrls.length > 0 && (
                            <img
                                src={previewUrls[0]}
                                alt={campaign.title}
                                className="w-full h-64 object-cover rounded-lg"
                            />
                        )}

                        <div className="mt-4 space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-text">
                                    Category
                                </h3>
                                <p className="text-text-secondary">
                                    {campaign.category}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-text">
                                    Funding Goal
                                </h3>
                                <p className="text-text-secondary">
                                    $
                                    {parseFloat(campaign.goal).toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-text">
                                    End Date
                                </h3>
                                <p className="text-text-secondary">
                                    {new Date(
                                        campaign.deadline
                                    ).toLocaleDateString()}
                                </p>
                            </div>

                            {campaign.location && (
                                <div>
                                    <h3 className="text-lg font-semibold text-text">
                                        Location
                                    </h3>
                                    <p className="text-text-secondary">
                                        {campaign.location}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-text mb-2">
                                Summary
                            </h3>
                            <p className="text-text-secondary">
                                {campaign.summary}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-text mb-2">
                                Description
                            </h3>
                            <p className="text-text-secondary whitespace-pre-wrap">
                                {campaign.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
