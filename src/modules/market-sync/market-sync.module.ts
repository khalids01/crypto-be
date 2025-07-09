import { Module } from '@nestjs/common';
import { MarketSyncService } from './market-sync.service';

@Module({
  providers: [MarketSyncService]
})
export class MarketSyncModule {}
