import { Kline, RawKline } from "./type";

export function parseKline(raw: RawKline): Kline {
  return {
    openTime: new Date(raw[0]),
    open: parseFloat(raw[1]),
    high: parseFloat(raw[2]),
    low: parseFloat(raw[3]),
    close: parseFloat(raw[4]),
    volume: parseFloat(raw[5]),
    closeTime: new Date(raw[6]),
    trades: raw[8]
  };
}

export function parseKlines(data: RawKline[]): Kline[] {
  return data.map(parseKline);
}

export function getClosePrices(klines: Kline[]): number[] {
  return klines.map(k => k.close);
}

export function calculatePercentageChange({oldPrice, newPrice}:{oldPrice: number, newPrice: number}): number {
  return ((newPrice - oldPrice) / oldPrice) * 100;
}
