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
    status?: "active" | "completed";
    profiles?: {
        username: string;
        wallet_address: string | null;
    };
    tx_hash?: string;
    onchain_id?: number;
}

export interface CampaignFormData extends Omit<Campaign, "goal" | "images"> {
    goal: string;
    images: (string | File)[];
}
