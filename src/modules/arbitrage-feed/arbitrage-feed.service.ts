import { Injectable } from '@nestjs/common';
import { platforms, symbols } from '@/lib/tracking-data';
import { QueryDto } from './dto/query.dto';
import { PrismaService } from '@/modules/prisma/prisma.service';

@Injectable()
export class ArbitrageFeedService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryDto) {
    const { symbol, interval, limit } = query ?? {
      symbol: symbols.DOGEUSDC,
      interval: '1m',
      limit: 12,
    };
    const coinData = await this.prisma.coinData.findUnique({
      where: {
        symbol,
      },
      include: {
        arbitrages: {
          include: {
            marketSnapshots: {
              orderBy: {
                openTime: 'desc',
              },
              take: limit,
            },
          },
        },
      },
    });
    return {
      total: coinData.arbitrages.length,
      symbol,
      interval,
      limit,
      data: [{ name: 'Binance', color: '#f59e0b', data: coinData }],
    };
  }
}
