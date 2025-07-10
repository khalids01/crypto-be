import { KucoinKlineResponse } from './type';
import { RetryOptions, withRetry } from '../retry';
import axios, { AxiosRequestConfig } from 'axios';
import { env } from '@/env';
import { endpoints } from './endpoints';

const axiosInstance = axios.create({
  baseURL: env.KUCOIN_BASE_URL,
});

const DEFAULT_RETRY_OPTIONS = {
  maxRetries: 3,
  delayBetweenRetries: 1000, // 1 second
};

axiosInstance.interceptors.request.use((config) => {
  const contentType =
    config.data instanceof FormData
      ? 'multipart/form-data'
      : 'application/json';

  config.headers.set('Content-Type', contentType);

  return config;
});

export interface KucoinApiConfig extends AxiosRequestConfig {
  retryOptions?: RetryOptions;
}

/**
 * Make an API request to KuCoin
 */
export async function kucoinApi<T = any>(
  url: string,
  config: KucoinApiConfig = {},
): Promise<T> {
  try {
    const response = await withRetry(
      () =>
        axiosInstance.request<T>({
          url,
          ...config,
          validateStatus: (status) => status >= 200 && status < 500,
        }),
      config.retryOptions,
    );

    return response.data;
  } catch (error) {
    console.error('KuCoin API request failed:', error);
    throw error;
  }
}

export async function fetchKlines(
  symbol: string,
  startAt: number,
  endAt: number,
  interval: string = '1min',
  config: KucoinApiConfig = {},
) {
  
  const response = await kucoinApi<KucoinKlineResponse>(
    endpoints.market.candles,
    {
      ...config,
      params: {
        symbol,
        type: interval,
        startAt,
        endAt,
      },
    },
  );

  if (response.code !== '200000') {
    throw new Error(
      `KuCoin API error: ${response.code} - ${response.data || 'Unknown error'}`,
    );
  }

  return response.data;
}

export async function kuCoinFetchLatestKline({
  symbol,
  interval = '1min',
  lookbackSeconds = 60,
  config = {},
}: {
  symbol: string;
  interval?: string;
  lookbackSeconds?: number;
  config?: KucoinApiConfig;
}) {
  const now = Math.floor(Date.now() / 1000);
  const endAt = now - (now % 60);
  const startAt = endAt - 600;

  const klines = await fetchKlines(
    symbol,
    startAt,
    endAt,
    interval,
    config,
  );
  return klines; // Return the most recent kline
}
