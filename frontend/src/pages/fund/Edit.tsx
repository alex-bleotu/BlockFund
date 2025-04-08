import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { Campaign, CAMPAIGN_CATEGORIES } from "../../lib/types";
import { FundingInput } from "./components/FundingInput";
import { ImageUpload } from "./components/ImageUpload";
import { PreviewStep } from "./components/PreviewStep";
import { StepIndicator } from "./components/StepIndicator";

export function EditFund() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [formData, setFormData] = useState<Partial<Campaign>>({
        title: "",
        category: "",
        goal: "",
        summary: "",
        description: "",
        location: "",
        deadline: "",
        images: [],
    });

    useEffect(() => {
        if (id) {
            fetchCampaign();
        }
    }, [id]);

    const fetchCampaign = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("campaigns")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;

            if (data.creator_id !== user?.id) {
                throw new Error(
                    "You do not have permission to edit this campaign"
                );
            }

            setFormData(data);
            setPreviewUrls(data.images || []);
        } catch (err: any) {
            console.error("Error fetching campaign:", err);
            setError(err.message || "Failed to load campaign");
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

    const handleGoalChange = (value: string) => {
        setFormData((prev) => ({ ...prev, goal: value }));
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

            // Upload new images if any
            const newImages = formData.images?.filter(
                (img) => img instanceof File
            ) as File[];
            const imageUrls = await Promise.all(
                newImages.map(async (file) => {
                    const fileName = `${user.id}/${Date.now()}-${file.name}`;
                    const { data, error } = await supabase.storage
                        .from("campaign-images")
                        .upload(fileName, file);

                    if (error) throw error;
                    return data.path;
                })
            );

            // Combine existing image URLs with new ones
            const existingImages = formData.images?.filter(
                (img) => typeof img === "string"
            ) as string[];
            const allImages = [...existingImages, ...imageUrls];

            const { error } = await supabase
                .from("campaigns")
                .update({
                    title: formData.title,
                    category: formData.category,
                    goal: parseFloat(formData.goal as string),
                    summary: formData.summary,
                    description: formData.description,
                    location: formData.location,
                    deadline: formData.deadline,
                    images: allImages,
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
                    <h2 className="text-xl font-bold text-text mb-2">Error</h2>
                    <p className="text-text-secondary mb-4">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-primary hover:text-primary-dark transition-colors">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (currentStep === 4) {
        return (
            <div className="min-h-screen pt-16 bg-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-surface rounded-xl shadow-lg p-6 md:p-8">
                        <PreviewStep
                            campaign={formData}
                            previewUrls={previewUrls}
                            onBack={prevStep}
                            onSubmit={handleSubmit}
                            loading={loading}
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
                    onClick={() => navigate(-1)}
                    className="flex items-center text-text-secondary hover:text-text mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                </button>

                <div className="bg-surface rounded-xl shadow-lg p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-text">
                            Edit Campaign
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
                                        Campaign Title *
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text"
                                        placeholder="Give your campaign a catchy title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text mb-3">
                                        Category *
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                        {CAMPAIGN_CATEGORIES.map((category) => (
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

                                <FundingInput
                                    value={formData.goal as string}
                                    onChange={handleGoalChange}
                                />

                                <div>
                                    <label
                                        htmlFor="deadline"
                                        className="block text-sm font-medium text-text mb-2">
                                        End Date
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
                                        className="w-full py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text"
                                    />
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <label
                                        htmlFor="summary"
                                        className="block text-sm font-medium text-text mb-2">
                                        Summary *
                                    </label>
                                    <textarea
                                        id="summary"
                                        name="summary"
                                        required
                                        rows={3}
                                        value={formData.summary}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text"
                                        placeholder="Write a brief summary of your campaign"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="description"
                                        className="block text-sm font-medium text-text mb-2">
                                        Full Description *
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        required
                                        rows={6}
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text"
                                        placeholder="Provide detailed information about your campaign"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="location"
                                        className="block text-sm font-medium text-text mb-2">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text"
                                        placeholder="Where is your campaign based?"
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
                                    Back
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={nextStep}
                                className="ml-auto px-6 py-2 bg-primary text-light rounded-lg hover:bg-primary-dark transition-colors">
                                {currentStep === 3 ? "Preview" : "Next Step"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
