export interface Campaign {
  id: string;
  title: string;
  category: string;
  goal: number;
  summary: string;
  description: string;
  images: string[];
  location?: string;
  deadline: string;
  created_at: string;
  creator_id: string;
  current_amount: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
}

export const CAMPAIGN_CATEGORIES = [
  'Technology',
  'Art',
  'Music',
  'Film',
  'Games',
  'Publishing',
  'Fashion',
  'Food',
  'Community',
  'Education',
  'Environment',
  'Health',
  'Other'
] as const;

export type CampaignCategory = typeof CAMPAIGN_CATEGORIES[number];