import { Injectable } from '@nestjs/common';
import { binanceApi } from '@/lib/binance/api';
import { symbols } from '@/lib/tracking-data';
import { endpoints } from '@/lib/binance/endpoints';
import { parseKlines } from '@/lib/binance/util';
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
    const ticker = await binanceApi(endpoints.kline, {
      params: { symbol, interval, limit },
    });

    const parsedTickers = parseKlines(ticker);

    return {
      total: parsedTickers.length,
      symbol,
      interval,
      limit,
      data: [{ name: 'Binance', color: '#f59e0b', data: parsedTickers }],
    };
  }
}
