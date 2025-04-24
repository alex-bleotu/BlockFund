import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
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
    const [error, setError] = useState<string | null>(null);

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
            setError(externalError);
        }
    }, [externalError]);

    const handleSubmit = () => {
        if (!user) {
            setError("Please sign in to create a campaign");
            return;
        }
        onSubmit();
    };

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
                        onClick={handleSubmit}
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

            {(error || externalError) && (
                <div className="p-4 bg-error/10 text-error rounded-lg flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>{error || externalError}</span>
                </div>
            )}

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
                                    {parseFloat(campaign.goal).toLocaleString()}{" "}
                                    ETH
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
