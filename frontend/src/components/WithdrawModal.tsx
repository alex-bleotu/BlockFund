import { motion } from "framer-motion";
import { AlertCircle, Wallet, X } from "lucide-react";

interface WithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    campaignTitle: string;
    amount?: string;
    isProcessing?: boolean;
}

export function WithdrawModal({
    isOpen,
    onClose,
    onConfirm,
    campaignTitle,
    amount = "0",
    isProcessing = false,
}: WithdrawModalProps) {
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
                        disabled={isProcessing}
                        className="absolute right-4 top-4 p-2 text-text-secondary hover:text-text transition-colors disabled:opacity-50">
                        <X className="h-5 w-5" />
                    </button>

                    <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary-light text-primary mr-4">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-text">
                            Withdraw Funds
                        </h3>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between mb-2">
                            <span className="text-text-secondary">
                                Campaign:
                            </span>
                            <span className="text-text font-medium">
                                {campaignTitle}
                            </span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span className="text-text-secondary">Amount:</span>
                            <span className="text-primary font-bold">
                                {amount} ETH
                            </span>
                        </div>

                        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50">
                            <div className="flex">
                                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mr-2 mt-0.5" />
                                <div className="text-amber-700 dark:text-amber-300">
                                    <p className="font-medium mb-1">
                                        Important
                                    </p>
                                    <p className="text-sm">
                                        Withdrawing funds will close this
                                        campaign permanently. This action cannot
                                        be undone.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className="px-4 py-2 text-text-secondary hover:text-text transition-colors disabled:opacity-50">
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isProcessing}
                            className="px-6 py-2 bg-primary text-light rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
                            {isProcessing ? "Processing..." : "Withdraw"}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
