import { KucoinRawKline, Kline } from './type';

export function parseKucoinKline(raw: KucoinRawKline): Kline {
  return {
    openTime: new Date(parseInt(raw[0]) * 1000), // Convert seconds to milliseconds
    open: parseFloat(raw[1]),
    close: parseFloat(raw[2]),
    high: parseFloat(raw[3]),
    low: parseFloat(raw[4]),
    volume: parseFloat(raw[5]),
    turnover: parseFloat(raw[6]),
  };
}

export function parseKucoinKlines(data: KucoinRawKline[]): Kline[] {
  return data.map(parseKucoinKline);
}

export function getClosePrices(klines: Kline[]): number[] {
  return klines.map(k => k.close);
}

export function calculatePercentageChange({oldPrice, newPrice}: {oldPrice: number, newPrice: number}): number {
  return ((newPrice - oldPrice) / oldPrice) * 100;
}

// Helper to get current timestamp in seconds
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}
