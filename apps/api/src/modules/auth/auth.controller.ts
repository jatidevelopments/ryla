import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RegisterUserByEmailDto } from './dto/req/register-user-by-email.dto';
import { LoginUserDto } from './dto/req/login-user.dto';
import { AuthResponseDto } from './dto/res/auth-response.dto';
import { AuthService } from './services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  public async registerUserByEmail(
    @Body() dto: RegisterUserByEmailDto,
  ): Promise<AuthResponseDto> {
    // TODO: Get userAgent and IP from request
    return await this.authService.registerUserByEmail(dto, '', '');
  }

  @Post('login')
  public async loginUser(
    @Body() dto: LoginUserDto,
  ): Promise<AuthResponseDto> {
    // TODO: Get userAgent and IP from request
    return await this.authService.loginUser(dto, '', '');
  }
}

