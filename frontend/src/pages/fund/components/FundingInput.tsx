import { DollarSign, Feather as Ethereum } from 'lucide-react';
import { useEthPrice } from '../../../hooks/useEthPrice';
import { useState, useEffect } from 'react';

interface FundingInputProps {
  value: string;
  onChange: (value: string) => void;
  initialUsdAmount?: string;
}

export function FundingInput({ value, onChange, initialUsdAmount }: FundingInputProps) {
  const { ethPrice } = useEthPrice();
  const [usdAmount, setUsdAmount] = useState(initialUsdAmount || '');

  useEffect(() => {
    if (initialUsdAmount) {
      setUsdAmount(initialUsdAmount);
      const parsed = parseFloat(initialUsdAmount);
      if (!isNaN(parsed) && parsed >= 0 && ethPrice) {
        const convertedEth = (parsed / ethPrice).toString();
        onChange(convertedEth);
      }
    }
  }, [initialUsdAmount, ethPrice]);

  const handleUsdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    setUsdAmount(inputVal);
    const parsed = parseFloat(inputVal);

    if (!isNaN(parsed) && parsed >= 0 && ethPrice) {
      const convertedEth = (parsed / ethPrice).toString();
      onChange(convertedEth);
    } else {
      onChange('');
    }
  };

  return (
    <div>
      <label htmlFor="goal" className="block text-sm font-medium text-text mb-2">
        Funding Goal *
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="number"
            id="usd-amount"
            inputMode="decimal"
            step="any"
            value={usdAmount}
            onChange={handleUsdChange}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text"
            placeholder="USD Amount"
            min="10"
          />
        </div>
        <div className="relative">
          <Ethereum className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
          <input
            type="text"
            readOnly
            value={value ? `${parseFloat(value).toFixed(6)} ETH` : ''}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-surface text-text font-medium"
            placeholder="ETH Equivalent"
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