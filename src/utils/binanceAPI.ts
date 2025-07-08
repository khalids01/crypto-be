import axios, { AxiosResponse, AxiosError } from 'axios';

const BINANCE_BASE_URL = 'https://api.binance.com';
const BINANCE_FALLBACK_URL = 'https://api1.binance.com'; // Fallback URL

interface BinancePriceResponse {
  symbol: string;
  price: string;
  [key: string]: any; // For any additional properties that might be in the response
}

export interface PriceData {
  symbol: string;
  price: number;
}

/**
 * Get current price for a symbol from Binance
 * @param symbol - Trading pair symbol (e.g., 'SOLUSDC', 'DOGEUSDC')
 * @returns Promise with price data
 */
export async function getBinancePrices(symbol: string): Promise<PriceData> {
  // Format symbol properly (ensure uppercase)
  const formattedSymbol = symbol.toUpperCase();
  
  // Try with primary URL first, then fallback if needed
  try {
    return await fetchPriceWithRetry(formattedSymbol, BINANCE_BASE_URL);
  } catch (error) {
    console.log(`Retrying with fallback URL for ${formattedSymbol}...`);
    return await fetchPriceWithRetry(formattedSymbol, BINANCE_FALLBACK_URL);
  }
}

/**
 * Helper function to fetch price with retry logic
 */
async function fetchPriceWithRetry(
  symbol: string, 
  baseUrl: string, 
  maxRetries = 3
): Promise<PriceData> {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      // Add timeout to avoid hanging requests
      const response: AxiosResponse<BinancePriceResponse> = await axios.get(
        `${baseUrl}/api/v3/ticker/price`, 
        {
          params: { symbol },
          timeout: 5000, // 5 second timeout
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        }
      );

      if (!response.data?.price) {
        throw new Error(`No price data found for symbol: ${symbol}`);
      }

      console.log(`Successfully fetched Binance price for ${symbol}: ${response.data.price}`);
      
      return {
        symbol: response.data.symbol,
        price: parseFloat(response.data.price),
      };
    } catch (error) {
      retries++;
      
      if (retries >= maxRetries) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to fetch Binance prices after ${maxRetries} attempts:`, errorMessage);
        throw new Error(`Failed to fetch price after ${maxRetries} attempts: ${errorMessage}`);
      }
      
      // Wait before retrying (exponential backoff)
      const delay = 1000 * Math.pow(2, retries);
      console.log(`Attempt ${retries} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should theoretically never be reached due to the throw in the catch block,
  // but TypeScript needs a return here
  throw new Error('Unexpected error in fetchPriceWithRetry');
}