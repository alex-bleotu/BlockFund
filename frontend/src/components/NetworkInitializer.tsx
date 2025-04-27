import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export function ConfigInitializer() {
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
            } catch (err) {
                console.error("Failed to initialize network setting:", err);
            }
        };

        fetchConfig();
    }, []);

    return null;
}
