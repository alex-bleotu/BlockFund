import { t } from "@lingui/core/macro";
import { AlertTriangle, ArrowLeft, Power } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useEthPrice } from "../../hooks/useEthPrice";
import { supabase } from "../../lib/supabase";
import { CampaignFormData } from "../../lib/types";
import { ImageUpload } from "./components/ImageUpload";
import { PreviewStep } from "./components/PreviewStep";
import { StatusModal } from "./components/StatusModal";
import { StepIndicator } from "./components/StepIndicator";

export function EditFund() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { ethPrice } = useEthPrice();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [formData, setFormData] = useState<CampaignFormData>({
        title: "",
        category: "",
        goal: "",
        summary: "",
        description: "",
        location: "",
        deadline: "",
        images: [],
    });
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    const [campaignStatus, setCampaignStatus] = useState<string>("active");

    const CampaignCategories = [
        t`Technology`,
        t`Art`,
        t`Music`,
        t`Film`,
        t`Games`,
        t`Publishing`,
        t`Fashion`,
        t`Food`,
        t`Community`,
        t`Education`,
        t`Environment`,
        t`Health`,
        t`Other`,
    ] as const;

    useEffect(() => {
        if (!user) {
            navigate("/login", { state: { from: `/campaign/edit/${id}` } });
            return;
        }
        if (id) {
            fetchCampaign();
        }
    }, [id, user]);

    const fetchCampaign = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("campaigns")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;

            if (!data) {
                throw new Error("Campaign not found");
            }

            if (data.creator_id !== user?.id) {
                navigate(`/campaign/${id}`);
                throw new Error(
                    "You do not have permission to edit this campaign"
                );
            }

            setFormData({
                ...data,
                goal: data.goal.toString(),
                images: data.images || [],
            });
            setCampaignStatus(data.status || "active");
            setPreviewUrls(data.images || []);
        } catch (err: any) {
            console.error("Error fetching campaign:", err);
            setError(err.message || "Failed to load campaign");
            if (
                err.message ===
                "You do not have permission to edit this campaign"
            ) {
                setTimeout(() => {
                    navigate(`/campaign/${id}`);
                }, 3000);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setFormData((prev) => ({
                ...prev,
                images: [...(prev.images || []), ...files],
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
            images: (prev.images || []).filter((_, i) => i !== index),
        }));

        URL.revokeObjectURL(previewUrls[index]);
        setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!user || !id) {
            setError("Something went wrong");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const newFiles = formData.images.filter(
                (img): img is File => img instanceof File
            );
            const existingUrls = formData.images.filter(
                (img): img is string => typeof img === "string"
            );

            const { data: campaignData, error: fetchError } = await supabase
                .from("campaigns")
                .select("images")
                .eq("id", id)
                .single();
            if (fetchError) throw fetchError;

            const oldUrls: string[] = campaignData.images || [];
            const removedUrls = oldUrls.filter(
                (url) => !existingUrls.includes(url)
            );
            if (removedUrls.length) {
                const removedPaths = removedUrls.map((url) => {
                    const urlObj = new URL(url);
                    const segments = urlObj.pathname.split("/");
                    const idx = segments.findIndex(
                        (seg) => seg === "campaign-images"
                    );
                    return segments.slice(idx + 1).join("/");
                });

                const { error: deleteError } = await supabase.storage
                    .from("campaign-images")
                    .remove(removedPaths);

                if (deleteError) throw deleteError;
            }

            const newPaths = await Promise.all(
                newFiles.map(async (file) => {
                    const fileName = `${user.id}/${Date.now()}-${file.name}`;
                    const { data, error } = await supabase.storage
                        .from("campaign-images")
                        .upload(fileName, file);
                    if (error) throw error;
                    return data.path;
                })
            );

            const newPublicUrls = newPaths.map(
                (path) =>
                    supabase.storage.from("campaign-images").getPublicUrl(path)
                        .data.publicUrl
            );

            const allImageUrls = [...existingUrls, ...newPublicUrls];

            const { error } = await supabase
                .from("campaigns")
                .update({
                    title: formData.title,
                    category: formData.category,
                    goal: parseFloat(formData.goal) || 0,
                    summary: formData.summary,
                    description: formData.description,
                    location: formData.location,
                    deadline: formData.deadline,
                    images: allImageUrls,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", id)
                .eq("creator_id", user.id);

            if (error) throw error;

            navigate(`/campaign/${id}`);
        } catch (err: any) {
            console.error("Error updating campaign:", err);
            setError(err.message || "Failed to update campaign");
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

    const handleStatusChange = async () => {
        if (!user || !id) return;

        try {
            setStatusLoading(true);
            const newStatus =
                campaignStatus === "active" ? "inactive" : "active";

            const { error } = await supabase
                .from("campaigns")
                .update({ status: newStatus })
                .eq("id", id)
                .eq("creator_id", user.id);

            if (error) throw error;

            setCampaignStatus(newStatus);
            setShowStatusModal(false);
        } catch (err: any) {
            console.error("Error updating campaign status:", err);
            setError(err.message || "Failed to update campaign status");
        } finally {
            setStatusLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-error mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-text mb-2">{t`Error`}</h2>
                    <p className="text-text-secondary mb-4">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-primary hover:text-primary-dark transition-colors">
                        {t`Go Back`}
                    </button>
                </div>
            </div>
        );
    }

    if (currentStep === 4) {
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-surface rounded-xl shadow-lg p-6 md:p-8">
                        <PreviewStep
                            campaign={formData}
                            previewUrls={previewUrls}
                            onBack={prevStep}
                            onSubmit={handleSubmit}
                            loading={loading}
                            mode="edit"
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
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-text-secondary hover:text-text transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        {t`Back`}
                    </button>
                    <button
                        onClick={() => setShowStatusModal(true)}
                        className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                            campaignStatus === "active"
                                ? "bg-success/10 text-success hover:bg-success/20"
                                : "bg-error/10 text-error hover:bg-error/20"
                        }`}>
                        <Power className="w-4 h-4 mr-2" />
                        {campaignStatus === "active" ? t`Active` : t`Inactive`}
                    </button>
                </div>

                <div className="bg-surface rounded-xl shadow-lg p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-text">
                            {t`Edit Campaign`}
                        </h1>
                    </div>

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
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text"
                                        placeholder={t`Give your campaign a catchy title`}
                                    />
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
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                </div>

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
                                        value={formData.deadline?.split("T")[0]}
                                        onChange={handleChange}
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text mb-2">
                                        {t`Funding Goal`}
                                    </label>
                                    <div className="space-y-2">
                                        <div className="w-full px-4 py-3 border border-border rounded-lg bg-background-alt text-text">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <span className="text-lg font-semibold">
                                                        {formData.goal}
                                                    </span>
                                                    <span className="ml-2 text-text-secondary">
                                                        ETH
                                                    </span>
                                                </div>
                                                {ethPrice && (
                                                    <div className="text-text-secondary">
                                                        ≈ $
                                                        {(
                                                            parseFloat(
                                                                formData.goal ||
                                                                    "0"
                                                            ) * ethPrice
                                                        ).toLocaleString()}{" "}
                                                        USD
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-text-secondary">
                                            {t`The funding goal cannot be modified after campaign creation`}
                                        </p>
                                    </div>
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
                                        value={formData.summary}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text"
                                        placeholder={t`Write a brief summary of your campaign`}
                                    />
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
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text"
                                        placeholder={t`Provide detailed information about your campaign`}
                                    />
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
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text"
                                        placeholder={t`Where is your campaign based?`}
                                    />
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
                                className="ml-auto px-6 py-2 bg-primary text-light rounded-lg hover:bg-primary-dark transition-colors">
                                {currentStep === 3 ? t`Preview` : t`Next Step`}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <StatusModal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                onConfirm={handleStatusChange}
                currentStatus={campaignStatus}
                loading={statusLoading}
            />
        </div>
    );
}
