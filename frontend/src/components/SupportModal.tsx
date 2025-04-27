import { t } from "@lingui/core/macro";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, DollarSign, Wallet, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
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
    minAmount = 0.001,
}: SupportModalProps) {
    const { address, connectWallet } = useWallet();
    const { ethPrice } = useEthPrice();
    const [amount, setAmount] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const MAX_CONTRIBUTION = 10000;

    useEffect(() => {
        if (isOpen) {
            setAmount("");
            setError(null);
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let input = e.target.value;
        if (/^\d*\.?\d*$/.test(input)) {
            const parts = input.split(".");
            if (parts.length > 1 && parts[1].length > 3) {
                input = parts[0] + "." + parts[1].slice(0, 3);
            }
            setAmount(input);
            setError(null);
            const num = parseFloat(input);
            if (!isNaN(num) && num > MAX_CONTRIBUTION) {
                setError(
                    t`Maximum contribution is` +
                        " " +
                        MAX_CONTRIBUTION +
                        " " +
                        "ETH"
                );
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (error) return;
        const num = parseFloat(amount);
        if (isNaN(num) || num < minAmount || num > MAX_CONTRIBUTION) {
            setError(t`Please enter a valid amount`);
            return;
        }
        setIsSubmitting(true);
        try {
            await onSupport(num);
            onClose();
        } catch (err: any) {
            console.error(err);
            if (err.message.includes("user rejected action"))
                toast.error(t`You rejected the transaction. Please try again.`);
            else if (err.message.includes("insufficient funds"))
                toast.error(t`Insufficient balance. Please try again.`);
            else if (err.message.includes("could not coalesce"))
                toast.error(
                    t`Failed to send transaction. Please try again later.`
                );
            else
                toast.error(
                    t`Failed to process contribution. Please try again.`
                );
        } finally {
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
                            className="absolute right-4 top-4 p-2 text-text-secondary hover:text-text">
                            <X className="h-5 w-5" />
                        </button>
                        <h2 className="text-2xl font-bold text-text mb-2">
                            {t`Contribute to this Campaign`}
                        </h2>
                        <p className="text-text-secondary mb-6">
                            {t`Contribute to`} {campaignTitle}{" "}
                            {t`and help make it a reality`}
                        </p>
                        {error && (
                            <div className="mb-6 p-4 rounded-lg bg-error-light text-error flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2" />
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
                                    className="px-6 py-2 bg-primary text-light rounded-lg hover:bg-primary-dark">
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
                                            type="text"
                                            value={amount}
                                            onChange={handleAmountChange}
                                            pattern="[0-9]*[.]?[0-9]{0,3}"
                                            inputMode="decimal"
                                            step="0.001"
                                            min={minAmount}
                                            max={MAX_CONTRIBUTION}
                                            required
                                            className="w-full pl-10 pr-16 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text"
                                            placeholder={`${minAmount} or more`}
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                            <DollarSign className="h-5 w-5 text-text-secondary" />
                                        </div>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary">
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
                                        {t`Minimum contribution:`} {minAmount}{" "}
                                        ETH
                                    </div>
                                </div>
                                <div className="bg-background-alt rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">{t`Campaign Goal`}</span>
                                        <span className="font-medium text-text">
                                            {campaignGoal.toFixed(2)} ETH
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">{t`Amount Remaining`}</span>
                                        <span className="font-medium text-text">
                                            {remainingAmount.toFixed(2)} ETH
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">{t`Your Contribution`}</span>
                                        <span className="font-medium text-primary">
                                            {amount
                                                ? `${parseFloat(amount).toFixed(
                                                      3
                                                  )} ETH`
                                                : "0.000 ETH"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 text-text-secondary hover:text-text">
                                        {t`Cancel`}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={
                                            !!error ||
                                            !amount ||
                                            isSubmitting ||
                                            parseFloat(amount) < minAmount
                                        }
                                        className="px-6 py-2 bg-primary text-light rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isSubmitting
                                            ? t`Processing...`
                                            : t`Contribute`}
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
