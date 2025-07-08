import axios, { AxiosRequestConfig, AxiosResponse, isAxiosError } from 'axios';

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  retryOnStatusCodes?: number[];
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffFactor: 2,
  retryOnStatusCodes: [408, 429, 500, 502, 503, 504],
};

export async function withRetry<T>(
  requestFn: () => Promise<AxiosResponse<T>>,
  options: RetryOptions = {}
): Promise<AxiosResponse<T>> {
  const {
    maxRetries,
    initialDelayMs,
    maxDelayMs,
    backoffFactor,
    retryOnStatusCodes,
  } = { ...DEFAULT_RETRY_OPTIONS, ...options };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await requestFn();
      
      // If the response is successful, return it
      if (response.status >= 200 && response.status < 300) {
        return response;
      }

      // If we get a non-retryable status code, throw immediately
      if (!retryOnStatusCodes.includes(response.status)) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      lastError = error as Error;

      // If this is not an Axios error or we've reached max retries, rethrow
      if (!isAxiosError(error) || attempt === maxRetries) {
        break;
      }
    }

    // Calculate delay with exponential backoff and jitter
    const delayMs = Math.min(
      initialDelayMs * Math.pow(backoffFactor, attempt),
      maxDelayMs
    ) + (Math.random() * 1000);

    console.warn(
      `Attempt ${attempt + 1} failed. Retrying in ${Math.round(delayMs / 1000)}s...`,
      { error: lastError?.message }
    );

    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  throw new Error(
    `Failed after ${maxRetries + 1} attempts. Last error: ${lastError?.message}`
  );
}