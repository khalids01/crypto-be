import { Injectable } from '@nestjs/common';
import { platforms, symbols } from '@/lib/tracking-data';
import { QueryDto } from './dto/query.dto';
import { PrismaService } from '@/modules/prisma/prisma.service';

@Injectable()
export class ArbitrageFeedService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryDto) {
    const { symbol, interval, limit } = query ?? {
      symbol: symbols.BTCUSDC,
      interval: '1m',
      limit: 1440,
    };
    const coinData = await this.prisma.coinData.findUnique({
      where: {
        symbol: symbol ?? symbols.BTCUSDC,
      },
      include: {
        exchanges: {
          include: {
            marketSnapshots: {
              orderBy: {
                openTime: 'asc',
              },
              take: limit,
            },
          },
        },
      },
    });

    console.log(
      'Binance candles: ',
      coinData.exchanges.find((e) => e.exchange === 'binance')?.marketSnapshots
        .length,
    );
    console.log(
      'KuCoin candles: ',
      coinData.exchanges.find((e) => e.exchange === 'kucoin')?.marketSnapshots
        .length,
    );

    return coinData;
  }
}
