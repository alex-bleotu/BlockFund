import { ethers } from "ethers";
import { campaignContract } from "../../../lib/blockchain";
import { supabase } from "../../../lib/supabase";
import { Campaign } from "../../../lib/types";

export async function launchCampaign(
    campaign: Partial<Campaign>,
    images: File[],
    userId: string
): Promise<{ supabaseData: Campaign; txHash: string; error: Error | null }> {
    try {
        // Step 1: Store metadata in Supabase
        const { data: supabaseData, error: supabaseError } = await supabase
            .from("campaigns")
            .insert([
                {
                    creator_id: userId,
                    title: campaign.title,
                    category: campaign.category,
                    goal: parseFloat(campaign.goal as string),
                    summary: campaign.summary,
                    description: campaign.description,
                    location: campaign.location || null,
                    deadline: campaign.deadline,
                    images: campaign.images,
                    status: "active",
                },
            ])
            .select()
            .single();

        if (supabaseError) throw supabaseError;

        // Step 2: Interact with the blockchain
        const goal = ethers.parseEther(campaign.goal as string); // Convert goal to wei
        const deadline = Math.floor(
            new Date(campaign.deadline).getTime() / 1000
        ); // Convert deadline to Unix timestamp
        const metadataCID = supabaseData.id; // Use the Supabase campaign ID as the metadata reference

        // Call the blockchain's createCampaign function
        const tx = await campaignContract.createCampaign(
            goal,
            deadline,
            metadataCID
        );
        const receipt = await tx.wait();

        return { supabaseData, txHash: receipt.transactionHash, error: null };
    } catch (error) {
        console.error("Error launching campaign:", error);
        return { supabaseData: null, txHash: null, error: error as Error };
    }
}
