import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryDto {
  @ApiProperty({
    example: 'DOGEUSDC',
  })
  @IsString()
  @IsOptional()
  symbol: string;

  @ApiProperty({
    example: '1m | 5m | 1h | 1d',
  })
  @IsString()
  @IsOptional()
  interval: string;

  @ApiProperty({
    example: 10,
    description: 'Number of candles to return (max 1000, default 500)',
  })
  @IsNumber()
  @IsOptional()
  limit: number;
}
