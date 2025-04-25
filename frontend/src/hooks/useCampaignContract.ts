import { ethers } from "ethers";
import { useEffect, useState } from "react";
import CampaignArtifact from "../artifacts/contracts/Campaign.sol/Campaign.json";

const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS as string;

export function useCampaignContract() {
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(
        null
    );
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
    const [contract, setContract] = useState<ethers.Contract | null>(null);

    useEffect(() => {
        if ((window as any).ethereum) {
            const browserProvider = new ethers.BrowserProvider(
                (window as any).ethereum
            );
            setProvider(browserProvider);

            (async () => {
                try {
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
                    console.error("Account request error:", err);
                }
            })();
        } else {
            console.error("MetaMask not detected");
        }
    }, []);

    const createCampaign = async (
        goal: string,
        durationSec: number,
        metadataCID: string
    ) => {
        if (!contract) throw new Error("Contract not initialized");
        const goalWei = ethers.parseEther(goal);
        const deadline = Math.floor(Date.now() / 1000) + durationSec;
        const tx = await contract.createCampaign(
            goalWei,
            deadline,
            metadataCID
        );
        return tx.wait();
    };

    const getCampaign = async (id: number) => {
        if (!contract) throw new Error("Contract not initialized");
        const c = await contract.getCampaign(id);
        return {
            id: c[0].toNumber(),
            creator: c[1],
            goal: ethers.formatEther(c[2]),
            deadline: new Date(c[3].toNumber() * 1000),
            totalFunded: ethers.formatEther(c[4]),
            metadataCID: c[5],
            status: ["ACTIVE", "SUCCESSFUL", "CLOSED"][c[6].toNumber()],
        };
    };

    const contribute = async (id: number, amount: string) => {
        if (!contract) throw new Error("Contract not initialized");
        const value = ethers.parseEther(amount);
        const tx = await contract.contribute(id, { value });
        return tx.wait();
    };

    const withdraw = async (id: number) => {
        if (!contract) throw new Error("Contract not initialized");
        const tx = await contract.withdraw(id);
        return tx.wait();
    };

    const closeCampaign = async (id: number) => {
        if (!contract) throw new Error("Contract not initialized");
        const tx = await contract.closeCampaign(id);
        return tx.wait();
    };

    const getBalance = async () => {
        if (!provider || !signer) throw new Error("Provider not initialized");
        const addr = await signer.getAddress();
        const bal = await provider.getBalance(addr);
        return ethers.formatEther(bal);
    };

    return {
        createCampaign,
        getCampaign,
        contribute,
        withdraw,
        closeCampaign,
        getBalance,
    };
}
