import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { CAMPAIGN_CATEGORIES } from '../../lib/types';
import { StepIndicator } from './components/StepIndicator';
import { ImageUpload } from './components/ImageUpload';
import { FundingInput } from './components/FundingInput';
import { PreviewStep } from './components/PreviewStep';
import { launchCampaign } from './utils/launchCampaign';
import { useEthPrice } from '../../hooks/useEthPrice';
import { ArrowLeft } from 'lucide-react';

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
}

export function NewFund() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    category: '',
    goal: '',
    usdAmount: '',
    summary: '',
    description: '',
    location: '',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    images: []
  });

  // Calculate completion score based on required fields
  const completionScore = useMemo(() => {
    const requiredFields = {
      title: formData.title.length > 0,
      category: formData.category.length > 0,
      goal: parseFloat(formData.goal) > 0,
      summary: formData.summary.length > 0,
      description: formData.description.length > 0,
      images: formData.images.length > 0
    };

    const completedFields = Object.values(requiredFields).filter(Boolean).length;
    return Math.round((completedFields / Object.keys(requiredFields).length) * 100);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGoalChange = (value: string) => {
    setFormData(prev => ({ ...prev, goal: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...files]
      }));

      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('Please sign in to create a campaign');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: launchError } = await launchCampaign(formData, formData.images, user.id);
      if (launchError) throw launchError;
      navigate(`/campaign/${data.id}`);
    } catch (err: any) {
      console.error('Error creating campaign:', err);
      setError(err.message || 'Failed to create campaign');
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
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCategorySelect = (category: string) => {
    setFormData(prev => ({ ...prev, category }));
  };

  const handleBack = () => {
    navigate(-1);
  };

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
          onClick={handleBack}
          className="flex items-center text-text-secondary hover:text-text mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="bg-surface rounded-xl shadow-lg p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-text">Create Your Campaign</h1>
            <div className="text-sm text-text-secondary">
              Completion: <span className="font-bold text-primary">{completionScore}%</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-light text-error rounded-lg">
              {error}
            </div>
          )}

          <StepIndicator currentStep={currentStep} onStepClick={setStep} />

          <form className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-text mb-2">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text"
                    placeholder="Give your campaign a catchy title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-3">
                    Category *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {CAMPAIGN_CATEGORIES.map(category => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleCategorySelect(category)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          formData.category === category
                            ? 'bg-primary text-light scale-105'
                            : 'bg-background-alt text-text-secondary hover:bg-primary/10 hover:text-primary'
                        }`}
                      >
                        {category}
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
                  <label htmlFor="deadline" className="block text-sm font-medium text-text mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="deadline"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="summary" className="block text-sm font-medium text-text mb-2">
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
                  <label htmlFor="description" className="block text-sm font-medium text-text mb-2">
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
                  <label htmlFor="location" className="block text-sm font-medium text-text mb-2">
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
                  className="px-6 py-2 text-text-secondary hover:text-text transition-colors"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={nextStep}
                className="ml-auto px-6 py-2 bg-primary text-light rounded-lg hover:bg-primary-dark transition-colors"
              >
                {currentStep === 3 ? 'Preview' : 'Next Step'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}