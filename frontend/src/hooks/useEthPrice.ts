import { useCallback, useEffect, useState } from "react";

const FALLBACK_ETH_PRICE = 2500;
const CACHE_DURATION = 60_000;

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
        let isMounted = true;

        const fetchEthPrice = async () => {
            if (
                priceCache &&
                Date.now() - priceCache.timestamp < CACHE_DURATION
            ) {
                if (isMounted) {
                    setEthPrice(priceCache.price);
                    setLoading(false);
                }
                return;
            }

            try {
                const res = await fetch(
                    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
                );
                if (!res.ok) {
                    throw new Error(`CoinGecko returned ${res.status}`);
                }
                const json = await res.json();
                const price = json?.ethereum?.usd;
                if (typeof price !== "number") {
                    throw new Error("Invalid price data");
                }

                priceCache = {
                    price,
                    timestamp: Date.now(),
                };

                if (isMounted) {
                    setEthPrice(price);
                    setError(null);
                }
            } catch (err) {
                console.warn("ETH price fetch failed, using fallback", err);
                if (isMounted) {
                    setEthPrice(FALLBACK_ETH_PRICE);
                    setError("Using estimated ETH price");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchEthPrice();
        const intervalId = setInterval(fetchEthPrice, CACHE_DURATION);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, []);

    const convertUsdToEth = useCallback(
        (usdAmount: number) => (ethPrice ? usdAmount / ethPrice : null),
        [ethPrice]
    );

    const convertEthToUsd = useCallback(
        (ethAmount: number) => (ethPrice ? ethAmount * ethPrice : null),
        [ethPrice]
    );

    return { ethPrice, loading, error, convertUsdToEth, convertEthToUsd };
}
