import { ethers } from "ethers";

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    const wallet = new ethers.Wallet(
        "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e",
        provider
    );

    try {
        const balance = await provider.getBalance(wallet.address);

        const formattedBalance = ethers.formatEther(balance);

        console.log(`Wallet Address: ${wallet.address}`);
        console.log(`Current Balance: ${formattedBalance} ETH`);
    } catch (error) {
        console.error("Error fetching wallet balance:", error);
    }
}

main().catch((error) => {
    console.error("Error running the script:", error);
    process.exit(1);
});
