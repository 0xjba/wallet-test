import { createAuthenticationAdapter } from '@rainbow-me/rainbowkit';
import { useSignTypedData } from 'wagmi';

const hardcodedNonce = 'b998efce97bd4822fd871bb6c40fce6ace202272';

const authenticationAdapter = createAuthenticationAdapter({

  getNonce: async () => {
    //const response = await fetch('/api/nonce');
    return hardcodedNonce;
  },
  createMessage: ({ nonce, address, chainId }) => {
    // Create a EIP-712 formatted message
    const domain = {
      name: 'Ten',
      version: '1.0',
      chainId: 443,
      address,
    };

    const types = {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
      ],
      Authentication: [
        { name: 'Encryption Token', type: 'address' },
      ],
    };

    const message = {
      'Encryption Token': nonce, // Use the nonce as the encryption token
    };

    return {
      types,
      primaryType: 'Authentication',
      domain,
      message
    };
  },
  getMessageBody: ({ message }) => {
    // Extracting relevant information for a human-readable format
    const { domain, message: msg } = message;
    const formattedMessage = `Sign in to ${domain.name} Network with account ${domain.address} using Encryption Token: ${msg['Encryption Token']}`;
    
    return formattedMessage;
  },
  verify: async ({ message, signature }) => {
    const { domain } = message;
    const account = domain.address;
  
    // Sending POST request to the specified endpoint with the hardcoded nonce
    const verifyAuth = await fetch(`https://testnet.ten.xyz/v1/authenticate?token=${hardcodedNonce}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: account, signature }),
    });
    return Boolean(verifyAuth.ok);
  },
  signOut: async () => {
    // Implement logout functionality
    await fetch('/api/logout');
  },
});

export default authenticationAdapter;
