import { Web3Auth } from "@web3auth/web3auth";
import { CHAIN_NAMESPACES } from "@web3auth/base";

let web3auth = null;

export const initWeb3Auth = async () => {
  if (!web3auth) {
    web3auth = new Web3Auth({
      clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID,
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0x89", // Polygon
        rpcTarget: process.env.NEXT_PUBLIC_POLYGON_RPC_URL
      },
      uiConfig: {
        theme: "dark",
        loginMethodsOrder: ["google", "facebook", "twitter"]
      }
    });
    await web3auth.initModal();
  }
  return web3auth;
};

export async function signIn() {
  const web3auth = await initWeb3Auth();
  const provider = await web3auth.connect();
  return provider;
}

export async function getCurrentUser() {
  if (!web3auth) {
    await initWeb3Auth();
  }
  const user = await web3auth.getUserInfo();
  return user;
}

export async function signOut() {
  if (!web3auth) {
    await initWeb3Auth();
  }
  await web3auth.logout();
}

// Helper function to get Ethereum address from Web3Auth provider
export async function getAddress() {
  if (!web3auth) {
    await initWeb3Auth();
  }
  const provider = await web3auth.connect();
  const accounts = await provider.request({ method: "eth_accounts" });
  return accounts[0];
}

// Bridge function to maintain compatibility with existing auth system
export const compatAuth = {
  signUp: async (email, password, username) => {
    const provider = await signIn();
    const address = await getAddress();
    // Create profile in Ceramic
    // This will be implemented in Phase 2
    return { user: { id: address }, session: provider };
  },

  signIn: async (email, password) => {
    const provider = await signIn();
    const address = await getAddress();
    return { user: { id: address }, session: provider };
  },

  signOut: async () => {
    await signOut();
  },

  getCurrentUser: async () => {
    const user = await getCurrentUser();
    const address = await getAddress();
    return { 
      id: address,
      email: user.email,
      user_metadata: {
        username: user.name
      }
    };
  },

  resetPassword: async (email) => {
    throw new Error("Password reset not supported in Web3Auth. Please use social login or wallet.");
  },

  updatePassword: async (newPassword) => {
    throw new Error("Password update not supported in Web3Auth. Please use social login or wallet.");
  }
};