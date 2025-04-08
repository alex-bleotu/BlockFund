import { useState } from "react";
import { useAuth } from "./useAuth";

export function useCampaignActions(campaignId: string) {
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const toggleLike = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setIsLiked(!isLiked);

            // Here you would typically update the likes in your database
            // For now, we'll just toggle the state

            // Example database interaction:
            // const { error } = await supabase
            //   .from('campaign_likes')
            //   .upsert({
            //     campaign_id: campaignId,
            //     user_id: user.id,
            //     liked: !isLiked
            //   });

            // if (error) throw error;
        } catch (error) {
            console.error("Error toggling like:", error);
            setIsLiked(!isLiked);
        } finally {
            setLoading(false);
        }
    };

    const shareCampaign = async () => {
        try {
            const shareData = {
                title: "Check out this campaign on BlockFund",
                text: "Support this amazing campaign!",
                url: window.location.href,
            };

            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
            }
        } catch (error) {
            console.error("Error sharing campaign:", error);
        }
    };

    return {
        isLiked,
        likeCount,
        loading,
        toggleLike,
        shareCampaign,
    };
}
