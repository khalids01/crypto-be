import { PartialType } from '@nestjs/mapped-types';
import { CreateArbitrageFeedDto } from './create-arbitrage-feed.dto';

export class UpdateArbitrageFeedDto extends PartialType(CreateArbitrageFeedDto) {}
