import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-auth.dto';
import { RolesGuard } from './roles.guard';
import { AuthGuard } from './auth.guard';
import { Roles } from './roles.decarotor';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @I18n() i18n: I18nContext) {
    return await this.authService.register(createUserDto, i18n.lang);
  }

  @Post('login')
  async login(
    @Body('username') username: string,
    @Body('password') password: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.authService.login(username, password, i18n.lang);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post('add-admin')
  async addAdmin(@Body() createUserDto: CreateUserDto, @I18n() i18n: I18nContext) {
    return await this.authService.addAdmin(createUserDto, i18n.lang);
  }
}