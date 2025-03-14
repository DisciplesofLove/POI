// Feature flags for gradual migration
export const USE_WEB3_AUTH = process.env.NEXT_PUBLIC_USE_WEB3_AUTH === 'true';
export const USE_TABLELAND = process.env.NEXT_PUBLIC_USE_TABLELAND === 'true';
export const USE_CERAMIC = process.env.NEXT_PUBLIC_USE_CERAMIC === 'true';
export const USE_IPFS = process.env.NEXT_PUBLIC_USE_IPFS === 'true';
export const USE_XMTP = process.env.NEXT_PUBLIC_USE_XMTP === 'true';