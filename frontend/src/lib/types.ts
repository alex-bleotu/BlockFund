export const CAMPAIGN_CATEGORIES = [
    "Technology",
    "Art",
    "Music",
    "Film",
    "Games",
    "Publishing",
    "Fashion",
    "Food",
    "Community",
    "Education",
    "Environment",
    "Health",
    "Other",
] as const;

export interface Campaign {
    id?: string;
    title: string;
    category: string;
    goal: number;
    summary: string;
    description: string;
    location: string;
    deadline: string;
    images: string[];
    creator_id?: string;
    created_at?: string;
    updated_at?: string;
    raised?: number;
    supporters?: number;
    status?: "active" | "completed" | "cancelled";
    profiles?: {
        username: string;
        wallet_address: string | null;
    };
}

export interface CampaignFormData extends Omit<Campaign, "goal" | "images"> {
    goal: string;
    images: (string | File)[];
}
