import { env } from '@/env';
import axios, { AxiosRequestConfig } from 'axios';
import { RetryOptions, withRetry } from '../retry';

const axiosInstance = axios.create({
  baseURL: env.BINANCE_BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const contentType =
    config.data instanceof FormData
      ? 'multipart/form-data'
      : 'application/json';
  // config.headers['Content-Type'] = contentType;
  // config.headers['X-MBX-APIKEY'] = env.BINANCE_API_KEY;
  config.headers.set('Content-Type', contentType);
  config.headers.set('X-MBX-APIKEY', env.BINANCE_API_KEY);

  return config;
});

export interface BinanceApiConfig extends AxiosRequestConfig {
  retryOptions?: RetryOptions;
}

export const binanceApi = async <T = any>(
  url: string,
  config: BinanceApiConfig = {},
): Promise<T> => {
  try {
    const response = await withRetry<T>(
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
    console.error('Binance API request failed:', error);
    throw error;
  }
};

