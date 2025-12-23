import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IJwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserService } from './services/user.service';

@ApiTags('Users')
@Controller('user')
@UseGuards(JwtAccessGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  public async getCurrentUser(@CurrentUser() user: IJwtPayload) {
    const profile = await this.userService.getUserProfile(user.userId);
    return { user: profile };
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  public async updateProfile(
    @CurrentUser() user: IJwtPayload,
    @Body() updates: { name?: string; publicName?: string },
  ) {
    const profile = await this.userService.updateProfile(user.userId, updates);
    return { user: profile };
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update user settings' })
  public async updateSettings(
    @CurrentUser() user: IJwtPayload,
    @Body('settings') settings: string,
  ) {
    await this.userService.updateSettings(user.userId, settings);
    return { success: true };
  }

  @Delete('account')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user account' })
  public async deleteAccount(@CurrentUser() user: IJwtPayload) {
    await this.userService.deleteAccount(user.userId);
  }
}
