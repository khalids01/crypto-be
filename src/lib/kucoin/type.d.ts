import { AxiosRequestConfig } from 'axios';

export type KucoinRawKline = [
  string, // Timestamp (seconds)
  string, // Open
  string, // Close
  string, // High
  string, // Low
  string, // Volume
  string, // Turnover (quote volume)
];

export interface Kline {
  openTime: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  turnover: number;
}

export interface KucoinKlineResponse {
  code: string;
  data: KucoinRawKline[];
}

export interface KucoinApiConfig extends AxiosRequestConfig {
  retryOptions?: {
    maxRetries?: number;
    delayBetweenRetries?: number;
  };
}
