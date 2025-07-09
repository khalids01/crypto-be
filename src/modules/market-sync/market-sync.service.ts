import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { platforms, symbols } from '@/lib/tracking-data';
import { binanceApi } from '@/lib/binance/api';
import { endpoints } from '@/lib/binance/endpoints';
import { parseKlines } from '@/lib/binance/util';

@Injectable()
export class MarketSyncService {
  private readonly logger = new Logger(MarketSyncService.name);
  private readonly UPDATE_INTERVAL_MS = 60_000; // 60 seconds
  private readonly CLEANUP_INTERVAL_MS = 2 * 60 * 60 * 1000; // 2 hours
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
      });
    }, this.UPDATE_INTERVAL_MS);

    // Store the interval in the scheduler registry for proper cleanup
    this.schedulerRegistry.addInterval(
      'binanceDataFetch',
      this.updateIntervalId,
    );
  }

  private async fetchAndStoreData() {
    try {
      const symbol = symbols.BTCUSDC;
      const interval = '1m';
      const limit = 12; // Get only the latest data point

      const ticker = await binanceApi(endpoints.kline, {
        params: { symbol, interval, limit },
      });

      const parsedData = parseKlines(ticker);

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
        let arbitrage = await this.prisma.arbitrage.findUnique({
          where: {
            exchange_coinDataId: {
              exchange: platforms.binance,
              coinDataId: coinData.id,
            },
          },
        });
        if (!arbitrage) {
          arbitrage = await this.prisma.arbitrage.create({
            data: {
              exchange: platforms.binance,
              coinSymbol: symbol,
              coinDataId: coinData.id,
            },
          });
        }

        await this.prisma.marketSnapshot.createMany({
          data: parsedData.map(
            ({ openTime, closeTime, high, low, open, close, volume }) => ({
              arbitrageId: arbitrage.id,
              openTime,
              closeTime,
              open,
              high,
              low,
              close,
              volume,
            }),
          ),
        });
        // Store the data in the database using upsert to avoid duplicates

        this.logger.log(
          `Successfully updated market data for ${symbol} at ${new Date().toISOString()}`,
        );

        await this.cleanupOldSnapshots(arbitrage.id);
      }
    } catch (error) {
      this.logger.error('Error in fetchAndStoreData:', error);
      throw error; // Re-throw to be caught by the caller
    }
  }

  async cleanupOldSnapshots(arbitrageId: string) {
    const cutoff = new Date(Date.now() - this.CLEANUP_INTERVAL_MS);

    const deleted = await this.prisma.marketSnapshot.deleteMany({
      where: {
        arbitrageId,
        openTime: { lt: cutoff },
      },
    });

    console.log(
      `🧹 Cleanup complete: deleted ${deleted.count} snapshots older than 2 hours for arbitrageId: ${arbitrageId}`,
    );
  }
}
