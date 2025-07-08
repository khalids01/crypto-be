import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArbitrageFeedModule } from './modules/arbitrage-feed/arbitrage-feed.module';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'), // Explicitly point to .env file
    }),
    ArbitrageFeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
