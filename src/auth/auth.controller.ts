import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignUpDto } from './dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth Management')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<any> {
    return this.authService.login(loginDto);
  }

  @Post('signup')
  async register(@Body() signUp: SignUpDto): Promise<any> {
    return this.authService.register(signUp);
  }
}
