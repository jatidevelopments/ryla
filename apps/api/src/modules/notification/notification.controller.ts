import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { IJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { PageOptionsDto } from '../../common/dto/page-options.dto';
import { NotificationService } from './services/notification.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user notifications' })
  @HttpCode(HttpStatus.OK)
  async getNotifications(
    @CurrentUser() user: IJwtPayload,
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<any> {
    return await this.notificationService.getUserNotifications(
      user.userId,
      pageOptionsDto,
    );
  }

  @Post(':id/read')
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set is-read status for the specific notification' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAsRead(
    @CurrentUser() user: IJwtPayload,
    @Param('id', ParseIntPipe) notificationId: number,
  ): Promise<void> {
    await this.notificationService.markOneNotificationAsRead(
      user.userId,
      notificationId,
    );
  }

  @Post('read-all')
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Set is-read status for all unchecked notifications',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAllAsRead(@CurrentUser() user: IJwtPayload): Promise<void> {
    await this.notificationService.markAllUserNotificationsAsRead(user.userId);
  }
}

