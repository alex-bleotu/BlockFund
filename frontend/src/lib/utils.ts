import { t } from "@lingui/core/macro";

export const getCampaignCategory = (category: string) => {
    switch (category) {
        case "Technology":
            return t`Technology`;
        case "Art":
            return t`Art`;
        case "Music":
            return t`Music`;
        case "Film":
            return t`Film`;
        case "Games":
            return t`Games`;
        case "Publishing":
            return t`Publishing`;
        case "Fashion":
            return t`Fashion`;
        case "Food":
            return t`Food`;
        case "Community":
            return t`Community`;
        case "Education":
            return t`Education`;
        case "Environment":
            return t`Environment`;
        case "Health":
            return t`Health`;
        case "Other":
            return t`Other`;
        default:
            return t`Other`;
    }
};
