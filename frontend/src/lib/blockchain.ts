import { ethers } from 'ethers';

// Campaign Contract ABI - This should be replaced with your actual contract ABI
const CAMPAIGN_ABI = [
  // Add your contract ABI here
];

// Campaign Contract Address - This should be replaced with your actual contract address
const CAMPAIGN_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';

// Initialize provider and contract
let campaignContract;

if (typeof window !== 'undefined' && window.ethereum) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  provider.getSigner().then(signer => {
    campaignContract = new ethers.Contract(
      CAMPAIGN_CONTRACT_ADDRESS,
      CAMPAIGN_ABI,
      signer
    );
  });
}

export { campaignContract };