import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export function NetworkInitializer() {
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
                        localStorage.setItem("NETWORK", "sepolia");
                        console.log("Network initialized to default (sepolia)");
                    }
                }
            } catch (err) {
                console.error("Failed to initialize network setting:", err);
            }
        };

        fetchNetworkConfig();
    }, []);

    return null;
}
