import { t } from "@lingui/core/macro";
import { DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { useEthPrice } from "../../../hooks/useEthPrice";

interface FundingInputProps {
    value: string;
    onChange: (value: string) => void;
    initialUsdAmount?: string;
    onValidationChange?: (isValid: boolean) => void;
}

const MAX_FUNDING_GOAL = 10000;
const MIN_FUNDING_GOAL = 0.01;

export function FundingInput({
    value,
    onChange,
    initialUsdAmount,
    onValidationChange,
}: FundingInputProps) {
    const { ethPrice } = useEthPrice();
    const [usdAmount, setUsdAmount] = useState(initialUsdAmount || "");
    const [ethAmount, setEthAmount] = useState(value || "");
    const [error, setError] = useState<boolean>(false);

    const validateAmount = (amount: string) => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) {
            setError(true);
            onValidationChange?.(false);
            return false;
        }
        if (numAmount < MIN_FUNDING_GOAL) {
            setError(true);
            onValidationChange?.(false);
            return false;
        }
        if (numAmount > MAX_FUNDING_GOAL) {
            setError(true);
            onValidationChange?.(false);
            return false;
        }
        setError(false);
        onValidationChange?.(true);
        return true;
    };

    const handleUsdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputVal = e.target.value;
        if (/^\d*\.?\d*$/.test(inputVal)) {
            const parts = inputVal.split(".");
            if (parts.length > 1 && parts[1].length > 2) {
                const truncated = parts[0] + "." + parts[1].substring(0, 2);
                setUsdAmount(truncated);
                const parsedUsd = parseFloat(truncated);
                if (!isNaN(parsedUsd) && parsedUsd >= 0 && ethPrice) {
                    const rawEth = (parsedUsd / ethPrice).toFixed(3);
                    const convertedEth = parseFloat(rawEth).toString();
                    setEthAmount(convertedEth);
                    onChange(convertedEth);
                    validateAmount(convertedEth);
                }
                return;
            }
            setUsdAmount(inputVal);
            const parsedUsd = parseFloat(inputVal);
            if (!isNaN(parsedUsd) && parsedUsd >= 0 && ethPrice) {
                const rawEth = (parsedUsd / ethPrice).toFixed(3);
                const convertedEth = parseFloat(rawEth).toString();
                setEthAmount(convertedEth);
                onChange(convertedEth);
                validateAmount(convertedEth);
            } else {
                setEthAmount("");
                onChange("");
                onValidationChange?.(false);
            }
        }
    };

    const handleUsdBlur = () => {
        const parsedEth = parseFloat(ethAmount);
        if (isNaN(parsedEth) || parsedEth < MIN_FUNDING_GOAL) {
            const minEthStr = MIN_FUNDING_GOAL.toString();
            setEthAmount(minEthStr);
            onChange(minEthStr);
            validateAmount(minEthStr);
            if (ethPrice) {
                const updatedUsd = (MIN_FUNDING_GOAL * ethPrice).toFixed(2);
                setUsdAmount(updatedUsd);
            }
        }
    };

    const handleEthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputVal = e.target.value;
        if (/^\d*\.?\d*$/.test(inputVal)) {
            const parts = inputVal.split(".");
            let newEth = inputVal;
            if (parts.length > 1 && parts[1].length > 3) {
                newEth = parts[0] + "." + parts[1].substring(0, 3);
            }
            const parsedEth = parseFloat(newEth);
            if (!isNaN(parsedEth)) {
                newEth = parsedEth.toString();
            }
            setEthAmount(newEth);
            onChange(newEth);
            validateAmount(newEth);
            if (!isNaN(parsedEth) && parsedEth >= 0 && ethPrice) {
                const convertedUsd = (parsedEth * ethPrice).toFixed(2);
                setUsdAmount(convertedUsd);
            } else {
                setUsdAmount("");
            }
        }
    };

    useEffect(() => {
        if (value !== ethAmount) {
            const parsed = parseFloat(value);
            const normalized = isNaN(parsed) ? "" : parsed.toString();
            setEthAmount(normalized);
            validateAmount(normalized);
            if (!isNaN(parsed) && ethPrice) {
                setUsdAmount((parsed * ethPrice).toFixed(2));
            }
        }
    }, [value, ethPrice]);

    useEffect(() => {
        if (ethAmount && ethPrice) {
            const parsedEth = parseFloat(ethAmount);
            if (!isNaN(parsedEth)) {
                setUsdAmount((parsedEth * ethPrice).toFixed(2));
            }
        }
    }, [ethPrice]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (
            [46, 8, 9, 27, 13, 110, 190].includes(e.keyCode) ||
            (e.keyCode === 65 && (e.ctrlKey || e.metaKey)) ||
            (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) ||
            (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) ||
            (e.keyCode === 88 && (e.ctrlKey || e.metaKey)) ||
            (e.keyCode >= 35 && e.keyCode <= 39)
        ) {
            return;
        }
        if (e.key === "e" || e.key === "E") {
            e.preventDefault();
            return;
        }
        if (
            (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
            (e.keyCode < 96 || e.keyCode > 105)
        ) {
            e.preventDefault();
        }
    };

    return (
        <div>
            <label
                htmlFor="goal"
                className="block text-sm font-medium text-text mb-2">
                {t`Funding Goal`} *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                    <input
                        type="text"
                        id="usd-amount"
                        pattern="[0-9]*[.]?[0-9]{0,2}"
                        inputMode="decimal"
                        step="0.01"
                        value={usdAmount}
                        onChange={handleUsdChange}
                        onBlur={handleUsdBlur}
                        onKeyDown={handleKeyDown}
                        className={`appearance-none block w-full pl-10 px-3 py-2 border ${
                            error ? "border-error" : "border-border"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text`}
                        placeholder={t`USD Amount`}
                    />
                </div>
                <div className="relative">
                    <img
                        src="/eth.svg"
                        alt="ETH"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                    />
                    <input
                        type="text"
                        id="eth-amount"
                        pattern="[0-9]*[.]?[0-9]{0,3}"
                        inputMode="decimal"
                        step="0.001"
                        value={ethAmount}
                        onChange={handleEthChange}
                        onKeyDown={handleKeyDown}
                        className={`appearance-none block w-full pl-10 px-3 py-2	border ${
                            error ? "border-error" : "border-border"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text font-medium`}
                        placeholder={t`ETH Amount`}
                    />
                </div>
            </div>
            <div className="sm:flex gap-2 justify-between">
                {ethPrice && (
                    <p className="mt-2 text-sm text-text-secondary">
                        {t`Current ETH Price:`}{" "}
                        <span className="font-semibold">
                            ${ethPrice.toLocaleString()}
                        </span>
                    </p>
                )}
                <div>
                    <p className="mt-2 text-sm text-text-secondary">
                        {t`ETH Amount Range:`}{" "}
                        <span className="font-semibold">
                            {MIN_FUNDING_GOAL} - {MAX_FUNDING_GOAL} ETH
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
