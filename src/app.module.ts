import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArbitrageFeedModule } from './modules/arbitrage-feed/arbitrage-feed.module';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { PrismaModule } from './modules/prisma/prisma.module';
import { MarketSyncModule } from './modules/market-sync/market-sync.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'), // Explicitly point to .env file
    }),
    ScheduleModule.forRoot(),
    ArbitrageFeedModule,
    PrismaModule,
    MarketSyncModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
