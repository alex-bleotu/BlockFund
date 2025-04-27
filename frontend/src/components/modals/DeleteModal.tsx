import { t } from "@lingui/core/macro";
import { motion } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    campaignTitle: string;
    isDeleting?: boolean;
    isWalletConnected?: boolean;
}

export function DeleteModal({
    isOpen,
    onClose,
    onConfirm,
    campaignTitle,
    isDeleting = false,
}: DeleteModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/50"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-md rounded-xl bg-surface p-6 shadow-xl">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="absolute right-4 top-4 p-2 text-text-secondary hover:text-text transition-colors disabled:opacity-50">
                        <X className="h-5 w-5" />
                    </button>

                    <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-error-light text-error mr-4">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-text">
                            {t`Delete Campaign`}
                        </h3>
                    </div>

                    <p className="text-text-secondary mb-6">
                        {t`Are you sure you want to delete` +
                            " " +
                            campaignTitle +
                            "? " +
                            t`This action will close the campaign on the blockchain and cannot be undone.`}
                    </p>

                    <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50 rounded-lg mb-6">
                        <div className="flex">
                            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mr-2 mt-0.5" />
                            <div className="text-amber-700 dark:text-amber-300">
                                <p className="font-medium mb-1">
                                    {t`Important`}
                                </p>
                                <p className="text-sm">
                                    {t`Please make sure to withdraw any remaining funds before deleting this campaign.`}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="px-4 py-2 text-text-secondary hover:text-text transition-colors disabled:opacity-50">
                            {t`Cancel`}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="px-6 py-2 bg-error text-light rounded-lg hover:bg-error-dark transition-colors disabled:opacity-50">
                            {isDeleting ? t`Deleting...` : t`Delete`}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
