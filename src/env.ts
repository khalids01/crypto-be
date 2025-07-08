import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Debug: Show current directory
console.log('Current directory:', __dirname);

// Try to find .env file
const envPath = path.resolve(process.cwd(), '.env');
console.log('Looking for .env at:', envPath);

// Check if .env file exists
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error('❌ Error loading .env file:', result.error);
  } else {
    console.log('✅ .env file loaded successfully');
    console.log('Loaded variables:', Object.keys(result.parsed || {}));
  }
} else {
  console.error('❌ .env file not found at:', envPath);
}

// Export environment variables
export const env = {
  BINANCE_BASE_URL: process.env.BINANCE_BASE_URL,
  BINANCE_API_KEY: process.env.BINANCE_API_KEY,
  BINANCE_SECRET_KEY: process.env.BINANCE_SECRET_KEY,
  SOLANA_RPC_URL: process.env.SOLANA_RPC_URL,
  SOLUSDC_MARKET_ADDRESS: process.env.SOLUSDC_MARKET_ADDRESS,
  DOGEUSDC_MARKET_ADDRESS: process.env.DOGEUSDC_MARKET_ADDRESS,
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
};

// Log all environment variables (for debugging)
console.log('Environment variables:');
Object.entries(env).forEach(([key, value]) => {
  console.log(`${key}: ${value ? '***' + String(value).slice(-4) : 'undefined'}`);
});