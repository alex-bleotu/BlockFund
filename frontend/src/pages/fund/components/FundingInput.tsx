import { DollarSign, Feather as Ethereum } from "lucide-react";
import { useEffect, useState } from "react";
import { useEthPrice } from "../../../hooks/useEthPrice";

interface FundingInputProps {
    value: string;
    onChange: (value: string) => void;
    initialUsdAmount?: string;
}

export function FundingInput({
    value,
    onChange,
    initialUsdAmount,
}: FundingInputProps) {
    const { ethPrice } = useEthPrice();
    const [usdAmount, setUsdAmount] = useState(initialUsdAmount || "");
    const [ethAmount, setEthAmount] = useState(value || "");

    useEffect(() => {
        if (initialUsdAmount) {
            setUsdAmount(initialUsdAmount);
            const parsed = parseFloat(initialUsdAmount);
            if (!isNaN(parsed) && parsed >= 0 && ethPrice) {
                const convertedEth = (parsed / ethPrice).toString();
                setEthAmount(convertedEth);
                onChange(convertedEth);
            }
        }
    }, [initialUsdAmount, ethPrice]);

    const handleUsdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputVal = e.target.value;
        // Only allow numbers and one decimal point
        if (/^\d*\.?\d*$/.test(inputVal)) {
            setUsdAmount(inputVal);
            const parsed = parseFloat(inputVal);

            if (!isNaN(parsed) && parsed >= 0 && ethPrice) {
                const convertedEth = (parsed / ethPrice).toFixed(3);
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
        // Only allow numbers and one decimal point
        if (/^\d*\.?\d*$/.test(inputVal)) {
            setEthAmount(inputVal);
            const parsed = parseFloat(inputVal);

            if (!isNaN(parsed) && parsed >= 0 && ethPrice) {
                const convertedUsd = (parsed * ethPrice).toFixed(3);
                setUsdAmount(convertedUsd);
                onChange(inputVal);
            } else {
                setUsdAmount("");
                onChange("");
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (
            [46, 8, 9, 27, 13, 110, 190].includes(e.keyCode) ||
            (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
            (e.keyCode === 67 && (e.ctrlKey === true || e.metaKey === true)) ||
            (e.keyCode === 86 && (e.ctrlKey === true || e.metaKey === true)) ||
            (e.keyCode === 88 && (e.ctrlKey === true || e.metaKey === true)) ||
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
                Funding Goal *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                    <input
                        type="text"
                        id="usd-amount"
                        pattern="[0-9]*[.]?[0-9]*"
                        inputMode="decimal"
                        step="any"
                        value={usdAmount}
                        onChange={handleUsdChange}
                        onKeyDown={handleKeyDown}
                        className="appearance-none block w-full pl-10 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text"
                        placeholder="USD Amount"
                        min="10"
                    />
                </div>
                <div className="relative">
                    <Ethereum className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                    <input
                        type="text"
                        id="eth-amount"
                        pattern="[0-9]*[.]?[0-9]*"
                        inputMode="decimal"
                        step="any"
                        value={ethAmount}
                        onChange={handleEthChange}
                        onKeyDown={handleKeyDown}
                        className="appearance-none block w-full pl-10 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text font-medium"
                        placeholder="ETH Amount"
                    />
                </div>
            </div>
            {ethPrice && (
                <p className="mt-2 text-sm text-text-secondary">
                    Current ETH Price: ${ethPrice.toLocaleString()}
                </p>
            )}
        </div>
    );
}
