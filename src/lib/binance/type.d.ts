interface BinancePriceResponse {
  symbol: string;
  price: string;
  [key: string]: any; // For any additional properties that might be in the response
}

export interface PriceData {
  symbol: string;
  price: number;
}
// Raw Binance Kline entry (array of strings/numbers)
type RawKline = [
  number, // Open time
  string, // Open
  string, // High
  string, // Low
  string, // Close
  string, // Volume
  number, // Close time
  string, // Quote asset volume
  number, // Number of trades
  string, // Taker buy base volume
  string, // Taker buy quote volume
  string, // Ignore
];

// Processed Kline with useful fields
export interface Kline {
  openTime: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: Date;
  trades: number;
}
