import { createContext, useContext, useEffect, useState } from "react";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { supabase } from "../lib/supabase";

interface ConfigContextType {
    isInitialized: boolean;
}

const ConfigContext = createContext<ConfigContextType>({
    isInitialized: false,
});

export const useConfig = () => useContext(ConfigContext);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const localNetwork = localStorage.getItem("NETWORK");

                if (localNetwork === null) {
                    const { data, error } = await supabase
                        .from("config")
                        .select("value")
                        .eq("key", "network")
                        .single();

                    if (error) {
                        console.error("Error fetching network config:", error);
                        return;
                    }

                    if (data && data.value) {
                        const networkValue = data.value;
                        localStorage.setItem("NETWORK", networkValue);
                        console.log(
                            `Network initialized to ${networkValue} from database config`
                        );
                    } else {
                        localStorage.setItem("NETWORK", "sepolia");
                        console.log("Network initialized to default (sepolia)");
                    }
                }

                const { data, error } = await supabase
                    .from("config")
                    .select("value")
                    .eq("key", "withdrawal_fee")
                    .single();

                if (error) {
                    console.error("Error fetching withdrawal fee:", error);
                    return;
                }

                if (data && data.value) {
                    const withdrawalFeeValue = data.value;
                    localStorage.setItem("WITHDRAWAL_FEE", withdrawalFeeValue);
                }

                setIsInitialized(true);
            } catch (err) {
                console.error("Failed to initialize network setting:", err);
            }
        };

        fetchConfig();
    }, []);

    if (!isInitialized) {
        return <LoadingSpinner />;
    }

    return (
        <ConfigContext.Provider value={{ isInitialized }}>
            {children}
        </ConfigContext.Provider>
    );
}
