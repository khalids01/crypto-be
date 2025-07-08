// src/config/env.ts
export const env = {
  BINANCE_BASE_URL: 'https://api.binance.com',
  BINANCE_API_KEY:
    'JTXLG32nvpseuhDj2GH3DAzvnGuTJ2rwe5Ucxc1dy6ZwMXVRT6iM2cxrBvCaiJ9x',
  BINANCE_SECRET_KEY:
    'OmLyLKgfAZrjy6aF6EHzopEah1lxwYd14Gy6wWi6bmB2IsMgktWDBFq8wOMEXhO1',
  SOLANA_RPC_URL: 'https://api.mainnet-beta.solana.com',
  SOLUSDC_MARKET_ADDRESS: '8BnEgHoWFysVcuFFX7QztDmzuH8r5ZFvyP3sYwn1XTh6',
  DOGEUSDC_MARKET_ADDRESS: '9tbLkxEjmu31ZRp6wbcqEfdE8QYGYpJruj56tzkQR4gJ',

  // Add any other environment variables you need
  NODE_ENV: 'development',
  PORT: 3004,
};

// Validation
if (!env.SOLANA_RPC_URL) {
  console.warn('SOLANA_RPC_URL is not set in .env file');
}

// You can add more validations as needed
