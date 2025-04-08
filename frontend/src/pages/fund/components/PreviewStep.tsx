import { Campaign } from '../../../lib/types';
import { useAuth } from '../../../hooks/useAuth';
import { Calendar, MapPin, User, Tag, Target, ChevronLeft, Rocket } from 'lucide-react';
import { useEthPrice } from '../../../hooks/useEthPrice';

interface PreviewStepProps {
  campaign: Partial<Campaign>;
  previewUrls: string[];
  onBack: () => void;
  onSubmit: () => void;
  loading?: boolean;
}

export function PreviewStep({ campaign, previewUrls, onBack, onSubmit, loading }: PreviewStepProps) {
  const { user } = useAuth();
  const { ethPrice } = useEthPrice();
  const ethAmount = parseFloat(campaign.goal || '0');
  const usdAmount = ethPrice ? ethAmount * ethPrice : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      formatted: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      daysLeft: diffDays
    };
  };

  const campaignEndDate = campaign.deadline ? formatDate(campaign.deadline) : null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center text-text-secondary hover:text-text transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Edit Campaign
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="flex items-center px-6 py-2.5 bg-primary text-light rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? (
            'Launching...'
          ) : (
            <>
              Launch Campaign
              <Rocket className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
        <div className="space-y-8">
          {/* Cover Image */}
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            {previewUrls[0] ? (
              <>
                <img
                  src={previewUrls[0]}
                  alt="Campaign Cover"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h1 className="text-3xl font-bold text-white mb-2">{campaign.title}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-white/90">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{user?.email?.split('@')[0]}</span>
                    </div>
                    {campaign.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{campaign.location}</span>
                      </div>
                    )}
                    {campaign.category && (
                      <div className="flex items-center space-x-2">
                        <Tag className="w-4 h-4" />
                        <span>{campaign.category}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-[400px] bg-background-alt rounded-xl flex items-center justify-center">
                <p className="text-text-secondary">No cover image</p>
              </div>
            )}
          </div>

          {/* Campaign Details */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-text mb-4">Campaign Summary</h2>
              <p className="text-text-secondary leading-relaxed">{campaign.summary}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-text mb-4">About this Campaign</h2>
              <div className="prose prose-sm max-w-none text-text-secondary">
                {campaign.description?.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Additional Images */}
            {previewUrls.length > 1 && (
              <div>
                <h2 className="text-xl font-semibold text-text mb-4">Campaign Gallery</h2>
                <div className="grid grid-cols-2 gap-4">
                  {previewUrls.slice(1).map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Campaign image ${index + 2}`}
                      className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-surface-alt rounded-xl p-6 shadow-lg">
            <div className="space-y-4">
              <div>
                <div className="text-text-secondary mb-1">Funding Goal</div>
                <div className="text-3xl font-bold text-text">
                  {ethAmount.toFixed(6)} ETH
                </div>
                <div className="text-sm text-text-secondary">
                  ~${usdAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-2 py-4 border-t border-border">
                
                  {campaignEndDate && (<div className="flex items-center text-text-secondary">
                  <Target className="w-5 h-5 mr-2" />
                  {campaignEndDate.daysLeft} days
                </div>)}
                <div className="flex flex-col ">
                  <div className="flex items-center text-text">
                    <Calendar className="w-4 h-4 mr-2" />
                    {campaignEndDate?.formatted}
                  </div>
                </div>
              </div>

              <div className="bg-background/50 rounded-lg p-4">
                <h3 className="font-medium text-text mb-2">What happens after launch?</h3>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li>• Your campaign will be live and visible to all users</li>
                  <li>• Supporters can start contributing to your goal</li>
                  <li>• You'll receive updates on campaign progress</li>
                  <li>• Funds are released once the goal is reached</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Creator Info */}
          <div className="bg-surface-alt rounded-xl p-6 shadow-lg">
            <h3 className="font-medium text-text mb-4">About the Creator</h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="font-medium text-text">
                  {user?.email?.split('@')[0]}
                </div>
                <div className="text-sm text-text-secondary">
                  Campaign Creator
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}