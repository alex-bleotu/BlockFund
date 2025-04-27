import { t } from "@lingui/core/macro";
import { DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { useEthPrice } from "../../../hooks/useEthPrice";

interface FundingInputProps {
    value: string;
    onChange: (value: string) => void;
    initialUsdAmount?: string;
    maxEthAmount?: number;
}

export function FundingInput({
    value,
    onChange,
    initialUsdAmount,
    maxEthAmount,
}: FundingInputProps) {
    const { ethPrice } = useEthPrice();
    const [usdAmount, setUsdAmount] = useState(initialUsdAmount || "");
    const [ethAmount, setEthAmount] = useState(value || "");

    const handleUsdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputVal = e.target.value;
        if (/^\d*\.?\d*$/.test(inputVal)) {
            const parts = inputVal.split(".");
            if (parts.length > 1 && parts[1].length > 2) {
                const truncated = parts[0] + "." + parts[1].substring(0, 2);
                setUsdAmount(truncated);

                const parsed = parseFloat(truncated);
                if (!isNaN(parsed) && parsed >= 0 && ethPrice) {
                    const convertedEth = (parsed / ethPrice).toFixed(2);
                    setEthAmount(convertedEth);
                    onChange(convertedEth);
                }
                return;
            }

            setUsdAmount(inputVal);
            const parsed = parseFloat(inputVal);

            if (!isNaN(parsed) && parsed >= 0 && ethPrice) {
                const convertedEth = (parsed / ethPrice).toFixed(2);
                setEthAmount(convertedEth);
                onChange(convertedEth);
            } else {
                setEthAmount("");
                onChange("");
            }
        }
    };

    const handleEthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputVal = e.target.value;

        if (/^\d*\.?\d*$/.test(inputVal)) {
            const parts = inputVal.split(".");
            if (parts.length > 1 && parts[1].length > 2) {
                const truncated = parts[0] + "." + parts[1].substring(0, 2);
                setEthAmount(truncated);
                onChange(truncated);

                const parsed = parseFloat(truncated);
                if (!isNaN(parsed) && parsed >= 0 && ethPrice) {
                    const convertedUsd = (parsed * ethPrice).toFixed(3);
                    setUsdAmount(convertedUsd);
                }
                return;
            }

            setEthAmount(inputVal);
            onChange(inputVal);

            const parsed = parseFloat(inputVal);
            if (!isNaN(parsed) && parsed >= 0 && ethPrice) {
                const convertedUsd = (parsed * ethPrice).toFixed(3);
                setUsdAmount(convertedUsd);
            } else {
                setUsdAmount("");
            }
        }
    };

    useEffect(() => {
        if (value !== ethAmount) {
            setEthAmount(value);
        }
    }, [value]);

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
                        onKeyDown={handleKeyDown}
                        className="appearance-none block w-full pl-10 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text"
                        placeholder={t`USD Amount`}
                        min="10"
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
                        pattern="[0-9]*[.]?[0-9]{0,2}"
                        inputMode="decimal"
                        step="0.01"
                        value={ethAmount}
                        onChange={handleEthChange}
                        onKeyDown={handleKeyDown}
                        className="appearance-none block w-full pl-10 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text font-medium"
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
                {maxEthAmount && (
                    <p className="mt-2 text-sm text-text-secondary">
                        {t`Maximum ETH Amount:`}{" "}
                        <span className="font-semibold">
                            {maxEthAmount} ETH
                        </span>
                    </p>
                )}
            </div>
        </div>
    );
}
