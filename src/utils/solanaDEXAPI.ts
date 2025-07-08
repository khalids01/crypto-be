import { Connection, PublicKey } from '@solana/web3.js';
import { Market } from '@openbook-dex/openbook';
import { env } from '@/env';

export interface DexPriceData {
  price: number;
}

const SOLANA_RPC_URL = env.SOLANA_RPC_URL;
if (!SOLANA_RPC_URL) {
  throw new Error("SOLANA_RPC_URL is not set in the environment variables.");
}

console.log('SOLANA_RPC_URL:', SOLANA_RPC_URL);

const OPENBOOK_PROGRAM_ID = new PublicKey("srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX");

/**
 * Fetches price data from a Solana DEX (OpenBook)
 * @param marketAddress - The market address to fetch prices for
 * @returns Promise with price data
 * @throws Will throw an error if market address is invalid or there's an issue fetching data
 */
export async function getDexPrices(marketAddress: string): Promise<DexPriceData> {
  if (!marketAddress) {
    throw new Error("Market address is not provided or is invalid.");
  }

  const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  
  try {
    const marketPublicKey = new PublicKey(marketAddress);
    
    const market = await Market.load(
      connection, 
      marketPublicKey, 
      {}, 
      OPENBOOK_PROGRAM_ID
    );

    const [bids, asks] = await Promise.all([
      market.loadBids(connection),
      market.loadAsks(connection)
    ]);

    const bestBid = bids.getL2(1)[0]?.[0] || 0;
    const bestAsk = asks.getL2(1)[0]?.[0] || 0;
    const midMarketPrice = (bestBid + bestAsk) / 2;

    console.log(`DEX Market Data for ${marketPublicKey.toString()}:`);
    console.log(`Best Bid: ${bestBid}, Best Ask: ${bestAsk}, Mid-Market Price: ${midMarketPrice}`);

    return { price: midMarketPrice };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes("Market not found")) {
      console.error(
        "Market not found. Ensure the market address is correct and the token pair exists on OpenBook.",
        errorMessage
      );
    } else {
      console.error("Error fetching Solana DEX prices:", errorMessage);
    }
    
    throw new Error(`Failed to fetch DEX prices: ${errorMessage}`);
  }
}