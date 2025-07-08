import { Injectable } from '@nestjs/common';
import { binanceApi } from '@/lib/binance/api';
import { CreateArbitrageFeedDto } from './dto/create-arbitrage-feed.dto';
import { UpdateArbitrageFeedDto } from './dto/update-arbitrage-feed.dto';
import { symbols } from '@/lib/tracking-data';
import { endpoints } from '@/lib/binance/endpoints';
import { parseKlines } from '@/lib/binance/util';

@Injectable()
export class ArbitrageFeedService {
  create(createArbitrageFeedDto: CreateArbitrageFeedDto) {
    return 'This action adds a new arbitrageFeed';
  }

  async findAll() {
    const ticker = await binanceApi(endpoints.kline, {
      params: { symbol: symbols.DOGEUSDC, interval: '1m', limit: 10 },
    });

    const parsedTickers = parseKlines(ticker);

    return parsedTickers;
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
