import { supabase } from "../../../lib/supabase";
import { Campaign } from "../../../lib/types";

export async function launchCampaign(
    campaign: Partial<Campaign>,
    userId: string
): Promise<{ supabaseData: Campaign | null; error: Error | null }> {
    try {
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
                },
            ])
            .select()
            .single();

        if (supabaseError) throw supabaseError;
        return { supabaseData, error: null };
    } catch (error) {
        console.error("Error launching campaign:", error);
        return { supabaseData: null, error: error as Error };
    }
}
