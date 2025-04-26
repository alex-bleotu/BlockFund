import { supabase } from "../../../lib/supabase";
import { Campaign } from "../../../lib/types";

export async function launchCampaign(
    campaign: Partial<Campaign>,
    userId: string,
    createCampaign: (
        goal: string,
        durationSec: number,
        metadataCID: string
    ) => Promise<any>
): Promise<{
    supabaseData: Campaign | null;
    onChainTx: any | null;
    error: Error | null;
}> {
    try {
        const deadline = new Date(campaign.deadline || new Date());
        const durationSec = Math.floor(
            (deadline.getTime() - Date.now()) / 1000
        );

        const onChainTx = await createCampaign(
            campaign.goal?.toString() || "0",
            durationSec,
            campaign.id || userId
        );

        const { data: supabaseData, error: supabaseError } = await supabase
            .from("campaigns")
            .insert([
                {
                    creator_id: userId,
                    title: campaign.title,
                    category: campaign.category,
                    goal: campaign.goal ? Number(campaign.goal) : 0,
                    summary: campaign.summary,
                    description: campaign.description,
                    location: campaign.location || null,
                    deadline: campaign.deadline || new Date().toISOString(),
                    images: campaign.images || [],
                    status: "active",
                    tx_hash: onChainTx.hash,
                    onchain_id: onChainTx.id,
                    network: campaign.network || "sepolia",
                },
            ])
            .select()
            .single();

        if (supabaseError) throw supabaseError;
        return { supabaseData, onChainTx: onChainTx.receipt, error: null };
    } catch (error) {
        console.error("Error launching campaign:", error);
        return { supabaseData: null, onChainTx: null, error: error as Error };
    }
}
