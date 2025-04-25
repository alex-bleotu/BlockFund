import { t } from "@lingui/core/macro";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, DollarSign, Wallet, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useEthPrice } from "../hooks/useEthPrice";
import { useWallet } from "../hooks/useWallet";

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaignTitle: string;
    campaignGoal: number;
    currentAmount: number;
    onSupport: (amount: number) => Promise<void>;
    minAmount?: number;
}

export function SupportModal({
    isOpen,
    onClose,
    campaignTitle,
    campaignGoal,
    currentAmount,
    onSupport,
    minAmount = 0.005,
}: SupportModalProps) {
    const { address, connectWallet } = useWallet();
    const { ethPrice } = useEthPrice();
    const [amount, setAmount] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAmount("");
            setError(null);
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (value === "" || /^\d*\.?\d*$/.test(value)) {
            setAmount(value);
            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            if (!amount || amount === "") {
                setError(t`Please enter an amount`);
                return;
            }

            const ethAmount = parseFloat(amount);

            if (isNaN(ethAmount)) {
                setError(t`Please enter a valid amount`);
                return;
            }

            if (ethAmount < minAmount) {
                setError(t`Minimum contribution is ${minAmount} ETH`);
                return;
            }

            setIsSubmitting(true);
            await onSupport(ethAmount);
        } catch (err) {
            console.error("Support error:", err);
            setError(t`Failed to process transaction`);
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const remainingAmount = campaignGoal - currentAmount;

    return (
        <AnimatePresence>
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
                        className="relative w-full max-w-lg rounded-xl bg-surface p-6 shadow-xl">
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 p-2 text-text-secondary hover:text-text transition-colors">
                            <X className="h-5 w-5" />
                        </button>

                        <h2 className="text-2xl font-bold text-text mb-2">
                            {t`Contribute to this Campaign`}
                        </h2>
                        <p className="text-text-secondary mb-6">
                            {t`Contribute to` +
                                " " +
                                campaignTitle +
                                " " +
                                t`and help make it a reality`}
                        </p>

                        {error && (
                            <div className="mb-6 p-4 rounded-lg bg-error-light text-error flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {!address ? (
                            <div className="text-center py-6">
                                <Wallet className="w-12 h-12 text-primary mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-text mb-2">
                                    {t`Connect your Wallet`}
                                </h3>
                                <p className="text-text-secondary mb-4">
                                    {t`Connect your wallet to contribute to this campaign`}
                                </p>
                                <button
                                    onClick={connectWallet}
                                    className="px-6 py-2 bg-primary text-light rounded-lg hover:bg-primary-dark transition-colors">
                                    {t`Connect Wallet`}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-text mb-2">
                                        {t`Amount to Contribute`}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={handleAmountChange}
                                            step="0.001"
                                            min={minAmount}
                                            required
                                            className="w-full pl-10 pr-16 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text"
                                            placeholder={`${minAmount} or more`}
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <DollarSign className="h-5 w-5 text-text-secondary" />
                                        </div>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-secondary">
                                            ETH
                                        </div>
                                    </div>
                                    {ethPrice &&
                                        amount &&
                                        !isNaN(parseFloat(amount)) && (
                                            <p className="mt-2 text-sm text-text-secondary">
                                                ≈ $
                                                {(
                                                    parseFloat(amount) *
                                                    ethPrice
                                                ).toLocaleString()}{" "}
                                                USD
                                            </p>
                                        )}
                                    <div className="mt-1 text-xs text-primary">
                                        {t`Minimum contribution: ${minAmount} ETH`}
                                    </div>
                                </div>

                                <div className="bg-background-alt rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">
                                            {t`Campaign Goal`}
                                        </span>
                                        <span className="text-text font-medium">
                                            {campaignGoal.toFixed(2)} ETH
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">
                                            {t`Amount Remaining`}
                                        </span>
                                        <span className="text-text font-medium">
                                            {remainingAmount.toFixed(2)} ETH
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">
                                            {t`Your Contribution`}
                                        </span>
                                        <span className="text-primary font-medium">
                                            {amount
                                                ? `${parseFloat(amount).toFixed(
                                                      2
                                                  )} ETH`
                                                : "0.00 ETH"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 text-text-secondary hover:text-text transition-colors"
                                        disabled={isSubmitting}>
                                        {t`Cancel`}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={
                                            isSubmitting ||
                                            !amount ||
                                            parseFloat(amount) <= 0
                                        }
                                        className="px-6 py-2 bg-primary text-light rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isSubmitting
                                            ? t`Processing...`
                                            : t`Contribute to Campaign`}
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </AnimatePresence>
    );
}
