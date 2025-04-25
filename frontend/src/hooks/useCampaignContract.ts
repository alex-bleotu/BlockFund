import { ethers } from "ethers";
import { useEffect, useState } from "react";
import CampaignArtifact from "../artifacts/contracts/Campaign.sol/Campaign.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as string;

const CONTRACT_ADDRESS_LOCAL = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
const USE_LOCAL = import.meta.env.VITE_USE_LOCAL === "true";

export function useCampaignContract() {
    const [provider, setProvider] = useState<ethers.Provider | null>(null);
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const finish = () => setLoading(false);

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
                if (USE_LOCAL) {
                    try {
                        await browserProvider.send(
                            "wallet_switchEthereumChain",
                            [{ chainId: "0x7A69" }]
                        );
                    } catch (switchError: any) {
                        console.error(
                            "Error switching to Hardhat network:",
                            switchError
                        );
                    }

                    await browserProvider.send("eth_requestAccounts", []);
                    const webSigner = await browserProvider.getSigner();
                    setSigner(webSigner);
                    setContract(
                        new ethers.Contract(
                            CONTRACT_ADDRESS_LOCAL,
                            CampaignArtifact.abi,
                            webSigner
                        )
                    );
                    finish();
                    return;
                }

                try {
                    await browserProvider.send("wallet_switchEthereumChain", [
                        { chainId: "0xaa36a7" },
                    ]);
                } catch (switchError: any) {
                    if (switchError.code === 4902) {
                        await browserProvider.send("wallet_addEthereumChain", [
                            {
                                chainId: "0xaa36a7",
                                chainName: "Sepolia Test Network",
                                rpcUrls: ["https://rpc.sepolia.org"],
                                nativeCurrency: {
                                    name: "Sepolia ETH",
                                    symbol: "SepoliaETH",
                                    decimals: 18,
                                },
                            },
                        ]);
                    } else {
                        throw switchError;
                    }
                }

                await browserProvider.send("eth_requestAccounts", []);
                const webSigner = await browserProvider.getSigner();
                setSigner(webSigner);
                setContract(
                    new ethers.Contract(
                        CONTRACT_ADDRESS,
                        CampaignArtifact.abi,
                        webSigner
                    )
                );
            } catch (err) {
                console.error(
                    "Error setting up provider or switching network:",
                    err
                );
            } finally {
                finish();
            }
        })();
    }, [USE_LOCAL]);

    const createCampaign = async (
        goal: string,
        durationSec: number,
        metadataCID: string
    ): Promise<{
        receipt: any;
        id: number;
    }> => {
        if (!contract) throw new Error("Contract not initialized");
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
        if (!contract) throw new Error("Contract not initialized");
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
        if (!contract) throw new Error("Contract not initialized");
        setLoading(true);
        try {
            if (!amount || amount.trim() === "") {
                throw new Error("Invalid amount");
            }

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
        if (!contract) throw new Error("Contract not initialized");
        setLoading(true);
        try {
            const tx = await contract.withdraw(id);
            return await tx.wait();
        } finally {
            setLoading(false);
        }
    };

    const closeCampaign = async (id: number) => {
        if (!contract) throw new Error("Contract not initialized");
        setLoading(true);
        try {
            const tx = await contract.closeCampaign(id);
            return await tx.wait();
        } finally {
            setLoading(false);
        }
    };

    const getBalance = async () => {
        if (!provider || !signer) throw new Error("Provider not initialized");
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
