import { t } from "@lingui/core/macro";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import CampaignArtifact from "../artifacts/contracts/Campaign.sol/Campaign.json";
import { useAuth } from "./useAuth";

const SEPOLIA_CONTRACT_ADDRESS = import.meta.env
    .VITE_SEPOLIA_CONTRACT_ADDRESS as string;
const MAINNET_CONTRACT_ADDRESS = import.meta.env
    .VITE_MAINNET_CONTRACT_ADDRESS as string;

const getContractAddressLocal = () => {
    const savedAddress = localStorage.getItem("CONTRACT_ADDRESS_LOCAL");
    return savedAddress ?? "";
};

const getNetwork = () => {
    const savedNetwork = localStorage.getItem("NETWORK");
    return (savedNetwork as "local" | "sepolia" | "mainnet") ?? "local";
};

export function useCampaignContract() {
    const { user } = useAuth();
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(
        null
    );
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const finish = () => setLoading(false);

        if (!user) {
            finish();
            return;
        }

        if (!(window as any).ethereum) {
            console.error("MetaMask not detected");
            finish();
            return;
        }

        const browserProvider = new ethers.BrowserProvider(
            (window as any).ethereum
        );
        setProvider(browserProvider);

        (async () => {
            try {
                const network = getNetwork();
                const configs: Record<
                    "local" | "sepolia" | "mainnet",
                    { chainId: string; addChainParams?: any; address: string }
                > = {
                    local: {
                        chainId: "0x7A69",
                        address: getContractAddressLocal(),
                    },
                    sepolia: {
                        chainId: "0xaa36a7",
                        addChainParams: {
                            chainId: "0xaa36a7",
                            chainName: "Sepolia Test Network",
                            rpcUrls: ["https://rpc.sepolia.org"],
                            nativeCurrency: {
                                name: "Sepolia ETH",
                                symbol: "SEP",
                                decimals: 18,
                            },
                        },
                        address: SEPOLIA_CONTRACT_ADDRESS,
                    },
                    mainnet: {
                        chainId: "0x1",
                        address: MAINNET_CONTRACT_ADDRESS,
                    },
                };
                const cfg = configs[network];
                if (!cfg) throw new Error(`Unsupported network: ${network}`);
                if (!cfg.address)
                    throw new Error(`No address configured for ${network}`);

                try {
                    await browserProvider.send("wallet_switchEthereumChain", [
                        { chainId: cfg.chainId },
                    ]);
                } catch (err: any) {
                    if (err.code === 4902 && cfg.addChainParams) {
                        await browserProvider.send("wallet_addEthereumChain", [
                            cfg.addChainParams,
                        ]);
                    } else {
                        throw err;
                    }
                }

                const webSigner = await browserProvider.getSigner();
                setSigner(webSigner);
                setContract(
                    new ethers.Contract(
                        cfg.address,
                        CampaignArtifact.abi,
                        webSigner
                    )
                );
            } catch (err) {
                console.error("Failed to init contract:", err);
            } finally {
                finish();
            }
        })();
    }, [user]);

    const createCampaign = async (
        goal: string,
        durationSec: number,
        metadataCID: string
    ): Promise<{ receipt: any; id: number }> => {
        if (!contract) throw new Error(t`Contract not initialized`);
        setLoading(true);
        try {
            const goalWei = ethers.parseEther(goal);
            const deadline = Math.floor(Date.now() / 1000) + durationSec;
            const tx = await contract.createCampaign(
                goalWei,
                deadline,
                metadataCID
            );
            const receipt = await tx.wait();
            let newId: number;
            const createdEvent = receipt.events?.find(
                (e: any) => e.event === "CampaignCreated"
            );
            if (createdEvent && createdEvent.args?.campaignId != null) {
                newId = Number(createdEvent.args.campaignId);
            } else {
                const count = await contract.getCampaignCount();
                newId = Number(count);
            }
            return { receipt, id: newId };
        } finally {
            setLoading(false);
        }
    };

    const getCampaign = async (id: number) => {
        if (!contract) throw new Error(t`Contract not initialized`);
        setLoading(true);
        try {
            const c = await contract.getCampaign(id);
            return {
                id: Number(c[0]),
                creator: c[1],
                goal: ethers.formatEther(c[2]),
                deadline: new Date(Number(c[3]) * 1000),
                totalFunded: ethers.formatEther(c[4]),
                metadataCID: c[5],
                status: ["ACTIVE", "SUCCESSFUL", "CLOSED"][Number(c[6])],
            };
        } finally {
            setLoading(false);
        }
    };

    const contribute = async (id: number, amount: string) => {
        if (!contract) throw new Error(t`Contract not initialized`);
        setLoading(true);
        try {
            if (!amount?.trim()) throw new Error(t`Invalid amount`);
            const value = ethers.parseEther(amount);
            const tx = await contract.contribute(id, { value });
            return await tx.wait();
        } catch (error) {
            console.error("Contribution error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const withdraw = async (id: number) => {
        if (!contract) throw new Error(t`Contract not initialized`);
        setLoading(true);
        try {
            const campaign = await getCampaign(id);
            if (campaign.status !== "CLOSED") {
                await contract.closeCampaign(id).then((tx) => tx.wait());
            }
            const tx = await contract.withdraw(id);
            return await tx.wait();
        } catch (error) {
            console.error("Error during withdrawal process:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const closeCampaign = async (id: number) => {
        if (!contract) throw new Error(t`Contract not initialized`);
        setLoading(true);
        try {
            const tx = await contract.closeCampaign(id);
            return await tx.wait();
        } finally {
            setLoading(false);
        }
    };

    const getBalance = async () => {
        if (!provider || !signer) throw new Error(t`Provider not initialized`);
        setLoading(true);
        try {
            const addr = await signer.getAddress();
            const bal = await provider.getBalance(addr);
            return ethers.formatEther(bal);
        } finally {
            setLoading(false);
        }
    };

    return {
        createCampaign,
        getCampaign,
        contribute,
        withdraw,
        closeCampaign,
        getBalance,
        loading,
        contract,
    };
}
