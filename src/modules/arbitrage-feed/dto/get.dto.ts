import { Kline } from '@/lib/binance/type';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class ArbitrageDto implements Kline {
  @ApiProperty({
    example: '2025-07-08T22:34:21.000Z',
  })
  @IsDateString()
  openTime: Date;

  @ApiProperty({
    example: '2025-07-08T22:34:21.000Z',
  })
  @IsDateString()
  closeTime: Date;

  @ApiProperty({
    example: '2025-07-08T22:34:21.000Z',
  })
  @IsDateString()
  open: number;

  @ApiProperty({
    example: '2025-07-08T22:34:21.000Z',
  })
  @IsDateString()
  high: number;

  @ApiProperty({
    example: '2025-07-08T22:34:21.000Z',
  })
  @IsDateString()
  low: number;

  @ApiProperty({
    example: '2025-07-08T22:34:21.000Z',
  })
  @IsDateString()
  close: number;

  @ApiProperty({
    example: '2025-07-08T22:34:21.000Z',
  })
  @IsDateString()
  volume: number;

  @ApiProperty({
    example: '2025-07-08T22:34:21.000Z',
  })
  @IsDateString()
  trades: number;
}

export class ArbitrageListDto {
  @ApiProperty({
    example: 10,
  })
  total: number;

  @ApiProperty({
    example: 'DOGEUSDC',
  })
  symbol: string;

  @ApiProperty({
    example: '1m',
  })
  interval: string;

  @ApiProperty({
    example: 10,
  })
  limit: number;

  data: ArbitrageDto[];
}
