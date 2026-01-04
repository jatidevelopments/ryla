import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { OutfitPresetsService } from './outfit-presets.service';
import { CreateOutfitPresetDto } from './dto/create-outfit-preset.dto';
import { UpdateOutfitPresetDto } from './dto/update-outfit-preset.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { IJwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('outfit-presets')
@UseGuards(JwtAccessGuard)
export class OutfitPresetsController {
  constructor(
    @Inject(OutfitPresetsService)
    private readonly outfitPresetsService: OutfitPresetsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: IJwtPayload, @Body() dto: CreateOutfitPresetDto) {
    return this.outfitPresetsService.create(user.userId, dto);
  }

  @Get('influencer/:influencerId')
  findAll(@CurrentUser() user: IJwtPayload, @Param('influencerId') influencerId: string) {
    return this.outfitPresetsService.findAll(user.userId, influencerId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: IJwtPayload, @Param('id') id: string) {
    return this.outfitPresetsService.findOne(user.userId, id);
  }

  @Put(':id')
  update(
    @CurrentUser() user: IJwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateOutfitPresetDto,
  ) {
    return this.outfitPresetsService.update(user.userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@CurrentUser() user: IJwtPayload, @Param('id') id: string) {
    return this.outfitPresetsService.remove(user.userId, id);
  }
}

