import { t } from "@lingui/macro";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

export function useCampaignActions(campaignId: string) {
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && campaignId) {
            const likedCampaigns = JSON.parse(
                localStorage.getItem("likedCampaigns") || "{}"
            );
            setIsLiked(!!likedCampaigns[`${user.id}_${campaignId}`]);
        }
    }, [user, campaignId]);

    const toggleLike = async () => {
        if (!user) return;

        try {
            setLoading(true);

            const newIsLiked = !isLiked;
            setIsLiked(newIsLiked);

            const likedCampaigns = JSON.parse(
                localStorage.getItem("likedCampaigns") || "{}"
            );
            const key = `${user.id}_${campaignId}`;

            if (newIsLiked) {
                likedCampaigns[key] = true;
            } else {
                delete likedCampaigns[key];
            }

            localStorage.setItem(
                "likedCampaigns",
                JSON.stringify(likedCampaigns)
            );
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
                title: t`Check out this campaign on BlockFund`,
                text: t`Support this amazing campaign!`,
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
        loading,
        toggleLike,
        shareCampaign,
    };
}
