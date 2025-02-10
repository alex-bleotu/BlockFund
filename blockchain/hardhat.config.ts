import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
    solidity: "0.8.28",
    networks: {
        sepolia: {
            url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
            accounts: process.env.WALLET_PRIVATE_KEY
                ? [process.env.WALLET_PRIVATE_KEY]
                : [],
        },
    },
};

export default config;
