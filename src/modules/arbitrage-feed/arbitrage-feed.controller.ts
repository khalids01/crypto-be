import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ArbitrageFeedService } from './arbitrage-feed.service';
import { CreateArbitrageFeedDto } from './dto/create-arbitrage-feed.dto';
import { UpdateArbitrageFeedDto } from './dto/update-arbitrage-feed.dto';
import { QueryDto } from './dto/query.dto';
import { ApiQuery } from '@nestjs/swagger';

@Controller('arbitrage-feed')
export class ArbitrageFeedController {
  constructor(private readonly arbitrageFeedService: ArbitrageFeedService) {}
  @ApiQuery({ type: QueryDto })
  @Get()
  findAll(@Query() query: QueryDto) {
    return this.arbitrageFeedService.findAll(query);
  }
}
