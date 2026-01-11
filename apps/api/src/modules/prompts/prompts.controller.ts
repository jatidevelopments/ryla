import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { PromptsService } from './services/prompts.service';
import { GetPromptsDto } from './dto/get-prompts.dto';

@ApiTags('Prompts')
@Controller('prompts')
@UseGuards(JwtAccessGuard)
@ApiBearerAuth()
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) { }

  /**
   * Get all prompts (favorites appear first for authenticated users)
   */
  @Get()
  @ApiOperation({ summary: 'Get all prompts' })
  @ApiResponse({ status: 200, description: 'List of prompts' })
  async findAll(
    @CurrentUser() user: IJwtPayload,
    @Query() query: GetPromptsDto,
  ) {
    return this.promptsService.findAll({
      userId: user.userId,
      category: query.category,
      rating: query.rating,
      search: query.search,
      limit: query.limit,
      offset: query.offset,
    });
  }

  /**
   * Get prompt by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get prompt by ID' })
  @ApiResponse({ status: 200, description: 'Prompt details' })
  @ApiResponse({ status: 404, description: 'Prompt not found' })
  async findById(@Param('id') id: string) {
    return this.promptsService.findById(id);
  }

  /**
   * Get user's favorite prompts
   */
  @Get('favorites/list')
  @ApiOperation({ summary: 'Get user favorites' })
  @ApiResponse({ status: 200, description: 'List of favorite prompts' })
  async getFavorites(@CurrentUser() user: IJwtPayload) {
    return this.promptsService.findFavorites(user.userId);
  }

  /**
   * Check if prompt is favorited
   */
  @Get(':id/favorite')
  @ApiOperation({ summary: 'Check if prompt is favorited' })
  @ApiResponse({ status: 200, description: 'Favorite status' })
  async checkFavorite(
    @CurrentUser() user: IJwtPayload,
    @Param('id') id: string,
  ) {
    return this.promptsService.isFavorited(user.userId, id);
  }

  /**
   * Add prompt to favorites
   */
  @Post(':id/favorite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add prompt to favorites' })
  @ApiResponse({ status: 200, description: 'Prompt favorited' })
  @ApiResponse({ status: 404, description: 'Prompt not found' })
  async addFavorite(
    @CurrentUser() user: IJwtPayload,
    @Param('id') id: string,
  ) {
    return this.promptsService.addFavorite(user.userId, id);
  }

  /**
   * Remove prompt from favorites
   */
  @Delete(':id/favorite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove prompt from favorites' })
  @ApiResponse({ status: 200, description: 'Prompt unfavorited' })
  async removeFavorite(
    @CurrentUser() user: IJwtPayload,
    @Param('id') id: string,
  ) {
    return this.promptsService.removeFavorite(user.userId, id);
  }

  /**
   * Get usage stats for a prompt
   */
  @Get(':id/stats')
  @ApiOperation({ summary: 'Get prompt usage statistics' })
  @ApiResponse({ status: 200, description: 'Prompt statistics' })
  @ApiResponse({ status: 404, description: 'Prompt not found' })
  async getStats(@Param('id') id: string) {
    return this.promptsService.getUsageStats(id);
  }

  /**
   * Get top used prompts
   */
  @Get('top/used')
  @ApiOperation({ summary: 'Get top used prompts' })
  @ApiResponse({ status: 200, description: 'Top used prompts' })
  async getTopUsed(@Query('limit') limit?: number) {
    return this.promptsService.getTopUsed(limit ? parseInt(limit.toString(), 10) : 10);
  }
}

