import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ArbitrageFeedService } from './arbitrage-feed.service';
import { CreateArbitrageFeedDto } from './dto/create-arbitrage-feed.dto';
import { UpdateArbitrageFeedDto } from './dto/update-arbitrage-feed.dto';

@Controller('arbitrage-feed')
export class ArbitrageFeedController {
  constructor(private readonly arbitrageFeedService: ArbitrageFeedService) {}

  @Post()
  create(@Body() createArbitrageFeedDto: CreateArbitrageFeedDto) {
    return this.arbitrageFeedService.create(createArbitrageFeedDto);
  }

  @Get()
  findAll() {
    return this.arbitrageFeedService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.arbitrageFeedService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArbitrageFeedDto: UpdateArbitrageFeedDto) {
    return this.arbitrageFeedService.update(+id, updateArbitrageFeedDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.arbitrageFeedService.remove(+id);
  }
}
