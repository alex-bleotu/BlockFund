import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function NetworkInitializer() {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const fetchNetworkConfig = async () => {
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
                        // Set default network if no value in database
                        localStorage.setItem("NETWORK", "sepolia");
                        console.log("Network initialized to default (sepolia)");
                    }
                } else {
                    console.log(
                        `Using existing network (${localNetwork}) from localStorage`
                    );
                }
            } catch (err) {
                console.error("Failed to initialize network setting:", err);
            } finally {
                setIsInitialized(true);
            }
        };

        fetchNetworkConfig();
    }, []);

    return null;
}
