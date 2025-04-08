import { useEffect, useState } from "react";

const FALLBACK_ETH_PRICE = 2500;
const CACHE_DURATION = 60000;

interface CacheItem {
    price: number;
    timestamp: number;
}

let priceCache: CacheItem | null = null;

export function useEthPrice() {
    const [ethPrice, setEthPrice] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEthPrice = async () => {
            try {
                if (
                    priceCache &&
                    Date.now() - priceCache.timestamp < CACHE_DURATION
                ) {
                    setEthPrice(priceCache.price);
                    setLoading(false);
                    return;
                }

                const response = await fetch(
                    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
                    {
                        headers: {
                            Accept: "application/json",
                            "Cache-Control": "no-cache",
                        },
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    // If API fails, use fallback price
                    console.warn("Using fallback ETH price due to API error");
                    setEthPrice(FALLBACK_ETH_PRICE);
                    setError("Using estimated ETH price");
                    return;
                }

                const data = await response.json();
                const price = data.ethereum.usd;

                priceCache = {
                    price,
                    timestamp: Date.now(),
                };

                setEthPrice(price);
                setError(null);
            } catch (err) {
                console.warn("Using fallback ETH price due to error:", err);
                setEthPrice(FALLBACK_ETH_PRICE);
                setError("Using estimated ETH price");
            } finally {
                setLoading(false);
            }
        };

        fetchEthPrice();
        const interval = setInterval(fetchEthPrice, CACHE_DURATION);
        return () => clearInterval(interval);
    }, []);

    const convertUsdToEth = (usdAmount: number) => {
        if (!ethPrice) return null;
        return usdAmount / ethPrice;
    };

    const convertEthToUsd = (ethAmount: number) => {
        if (!ethPrice) return null;
        return ethAmount * ethPrice;
    };

    return { ethPrice, loading, error, convertUsdToEth, convertEthToUsd };
}
