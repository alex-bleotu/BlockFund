import { t } from "@lingui/core/macro";

export const CAMPAIGN_CATEGORIES = [
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
    tx_hash?: string;
    onchain_id?: number;
}

export interface CampaignFormData extends Omit<Campaign, "goal" | "images"> {
    goal: string;
    images: (string | File)[];
}
