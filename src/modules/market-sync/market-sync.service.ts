import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { platforms, symbols } from '@/lib/tracking-data';
import { binanceApi } from '@/lib/binance/api';
import { endpoints } from '@/lib/binance/endpoints';
import { parseKlines } from '@/lib/binance/util';
import { kuCoinFetchLatestKline } from '@/lib/kucoin/api';
import { parseKucoinKlines } from '@/lib/kucoin/util';
import { intervals } from '@/lib/intervals';
import { getRelativeTime } from '@/utils/getRelativeTime';

@Injectable()
export class MarketSyncService {
  private readonly logger = new Logger(MarketSyncService.name);
  private readonly UPDATE_INTERVAL_MS = 60_000 * 60; // 1 m
  private readonly CLEANUP_INTERVAL_MS = 60_000 * 60 * 24; // 1 day
  private readonly LIMIT = 1440;
  private updateIntervalId: NodeJS.Timeout;

  constructor(
    private readonly prisma: PrismaService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    this.startDataCollection();
  }

  private startDataCollection() {
    // Initial fetch
    this.fetchAndStoreData().catch((err) => {
      this.logger.error('Initial data fetch failed', err);
    });

    // Set up interval for subsequent fetches
    this.updateIntervalId = setInterval(() => {
      this.fetchAndStoreData().catch((err) => {
        this.logger.error('Scheduled data fetch failed', err);
      }).finally(() => {
        this.logger.log('Scheduled data fetch completed');
      });
    }, this.UPDATE_INTERVAL_MS);

    // Store the interval in the scheduler registry for proper cleanup
    this.schedulerRegistry.addInterval('marketSync', this.updateIntervalId);
  }

  private getInterval(platform: string) {
    if (platform === platforms.binance) {
      return intervals.binance['1m'];
    }
    if (platform === platforms.kucoin) {
      return intervals.kucoin['1min'];
    }
  }

  private async fetchAndStoreData() {
    try {
      await Promise.all([this.binanceData(), this.kuCoinData()]);
    } catch (error) {
      this.logger.error('Error in fetchAndStoreData:', error);
      throw error; // Re-throw to be caught by the caller
    }
  }

  private async binanceData() {
    const symbol = symbols.BTCUSDC;
    const interval = this.getInterval(platforms.binance);

    const binanceTicker = await binanceApi(endpoints.kline, {
      params: { symbol, interval, limit: this.LIMIT },
    });

    const parsedData = parseKlines(binanceTicker);

    if (parsedData && parsedData.length > 0) {
      let coinData = await this.prisma.coinData.findUnique({
        where: {
          symbol,
        },
      });
      if (!coinData) {
        coinData = await this.prisma.coinData.create({
          data: {
            symbol,
            coinName: symbol,
          },
        });
      }
      let exchange = await this.prisma.exchange.findUnique({
        where: {
          exchange_coinDataId: {
            exchange: platforms.binance,
            coinDataId: coinData.id,
          },
        },
      });
      if (!exchange) {
        exchange = await this.prisma.exchange.create({
          data: {
            exchange: platforms.binance,
            coinSymbol: symbol,
            coinDataId: coinData.id,
          },
        });
      }

      // Process data in chunks to avoid too many DB operations at once
      for (const data of parsedData) {
        try {
          await this.prisma.marketSnapshot.upsert({
            where: {
              openTime_exchangeId: {
                exchangeId: exchange.id,
                openTime: data.openTime,
              },
            },
            create: {
              exchangeId: exchange.id,
              openTime: data.openTime,
              closeTime: data.closeTime,
              open: data.open,
              high: data.high,
              low: data.low,
              close: data.close,
              volume: data.volume,
            },
            update: {
              closeTime: data.closeTime,
              open: data.open,
              high: data.high,
              low: data.low,
              close: data.close,
              volume: data.volume,
            },
          });
        } catch (error) {
          this.logger.error(
            `Error upserting market snapshot: ${error.message}`,
          );
        }
      }
      // Store the data in the database using upsert to avoid duplicates

      this.logger.log(
        `Successfully updated market data for ${symbol} at ${new Date().toISOString()}`,
      );

      await this.cleanupOldSnapshots(exchange.id);
    }
  }

  private async kuCoinData() {
    const symbol = symbols.BTCUSDC;
    const interval = this.getInterval(platforms.kucoin);
    const intervalMs = this.UPDATE_INTERVAL_MS;
    const endAt = Math.floor(Date.now() / 1000); // current time
    const startAt = endAt - this.LIMIT * 60; // go back N minutes
    const kucoinTicker = await kuCoinFetchLatestKline({
      symbol: 'BTC-USDT',
      interval,
      lookbackSeconds: this.LIMIT * 60,
      startAt,
      endAt,
    });
    const parsedData = parseKucoinKlines(kucoinTicker);

    if (parsedData) {
      let coinData = await this.prisma.coinData.findUnique({
        where: {
          symbol,
        },
      });
      if (!coinData) {
        coinData = await this.prisma.coinData.create({
          data: {
            symbol,
            coinName: symbol,
          },
        });
      }
      let exchange = await this.prisma.exchange.findUnique({
        where: {
          exchange_coinDataId: {
            exchange: platforms.kucoin,
            coinDataId: coinData.id,
          },
        },
      });
      if (!exchange) {
        exchange = await this.prisma.exchange.create({
          data: {
            exchange: platforms.kucoin,
            coinSymbol: symbol,
            coinDataId: coinData.id,
            color: '#1CA4B6',
          },
        });
      }

      // Process data in chunks to avoid too many DB operations at once
      for (const data of parsedData) {
        try {
          await this.prisma.marketSnapshot.upsert({
            where: {
              openTime_exchangeId: {
                exchangeId: exchange.id,
                openTime: data.openTime,
              },
            },
            create: {
              exchangeId: exchange.id,
              openTime: data.openTime,
              closeTime: new Date(data.openTime.getTime() + intervalMs),
              open: data.open,
              high: data.high,
              low: data.low,
              close: data.close,
              volume: data.volume,
            },
            update: {
              closeTime: new Date(data.openTime.getTime() + intervalMs),
              open: data.open,
              high: data.high,
              low: data.low,
              close: data.close,
              volume: data.volume,
            },
          });
        } catch (error) {
          this.logger.error(
            `Error upserting market snapshot: ${error.message}`,
          );
        }
      }

      this.logger.log(
        `Successfully updated market data for ${symbol} at ${new Date().toISOString()}`,
      );

      await this.cleanupOldSnapshots(exchange.id);
    }
  }

  async cleanupOldSnapshots(exchangeId: string) {
    const cutoff = new Date(Date.now() - this.CLEANUP_INTERVAL_MS);

    const deleted = await this.prisma.marketSnapshot.deleteMany({
      where: {
        exchangeId,
        openTime: { lt: cutoff },
      },
    });

    console.log(
      `🧹 Cleanup complete: deleted ${deleted.count} snapshots older than ${getRelativeTime(cutoff)} for exchangeId: ${exchangeId}`,
    );
  }
}
