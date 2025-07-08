import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getBinancePrices } from '@/utils/binanceAPI';
import { getDexPrices } from '@/utils/solanaDEXAPI';
import {
  calculateBinanceFee,
  calculateSolanaFee,
} from '@/utils/feesCalculator';
import { calculateArbitrageOpportunity } from '@/utils/arbitrageCalculator';
import { CreateArbitrageFeedDto } from './dto/create-arbitrage-feed.dto';
import { UpdateArbitrageFeedDto } from './dto/update-arbitrage-feed.dto';
import { env } from '@/env';

interface TradingPair {
  symbol: string;
  dexMarketAddress: string;
  enabled: boolean;
}

@Injectable()
export class ArbitrageFeedService {
  private readonly logger = new Logger(ArbitrageFeedService.name);
  private pairs: TradingPair[] = [];

  constructor(private configService: ConfigService) {
    this.initializePairs();
  }

  private initializePairs() {
    const solUsdcAddress = env.SOLUSDC_MARKET_ADDRESS;
    const dogeUsdcAddress = env.DOGEUSDC_MARKET_ADDRESS;

    if (!solUsdcAddress || !dogeUsdcAddress) {
      throw new Error('Required market addresses are not configured');
    }

    this.pairs = [
      {
        symbol: 'SOLUSDC',
        dexMarketAddress: solUsdcAddress,
        enabled: true,
      },
      {
        symbol: 'DOGEUSDC',
        dexMarketAddress: dogeUsdcAddress,
        enabled: false,
      },
    ];
  }

  async scanArbitrageOpportunities() {
    const enabledPairs = this.pairs.filter((pair) => pair.enabled);
    const results = [];

    if (enabledPairs.length === 0) {
      this.logger.warn('No enabled pairs to scan');
      return [];
    }

    for (const { symbol, dexMarketAddress } of enabledPairs) {
      try {
        this.logger.log(`Scanning arbitrage for ${symbol}...`);

        const [binancePriceData, dexPriceData] = await Promise.all([
          getBinancePrices(symbol),
          getDexPrices(dexMarketAddress),
        ]);

        const binancePrice = parseFloat(String(binancePriceData.price));
        const dexPrice = parseFloat(String(dexPriceData.price));

        if (isNaN(binancePrice) || isNaN(dexPrice)) {
          throw new Error(`Invalid price data for ${symbol}`);
        }

        const binanceFee = calculateBinanceFee(binancePrice);
        const solanaFee = calculateSolanaFee(dexPrice);
        const totalFees = binanceFee + solanaFee;

        const arbitrageResult = calculateArbitrageOpportunity(
          binancePrice,
          dexPrice,
          totalFees,
        );

        const result = {
          symbol,
          binancePrice,
          dexPrice,
          totalFees,
          ...arbitrageResult,
          timestamp: new Date(),
        };

        results.push(result);

        this.logger.log(`Completed scan for ${symbol}`);
      } catch (error) {
        this.logger.error(
          `Error scanning ${symbol}: ${error.message}`,
          error.stack,
        );
      }
    }

    return results;
  }

  create(createArbitrageFeedDto: CreateArbitrageFeedDto) {
    return 'This action adds a new arbitrageFeed';
  }

  findAll() {
    return this.scanArbitrageOpportunities();
  }

  findOne(id: number) {
    return `This action returns a #${id} arbitrageFeed`;
  }

  update(id: number, updateArbitrageFeedDto: UpdateArbitrageFeedDto) {
    return `This action updates a #${id} arbitrageFeed`;
  }

  remove(id: number) {
    return `This action removes a #${id} arbitrageFeed`;
  }
}
