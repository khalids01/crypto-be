import { Module } from '@nestjs/common';
import { ArbitrageFeedService } from './arbitrage-feed.service';
import { ArbitrageFeedController } from './arbitrage-feed.controller';

@Module({
  controllers: [ArbitrageFeedController],
  providers: [ArbitrageFeedService],
})
export class ArbitrageFeedModule {}
