import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/auth.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-auth.dto';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService,
  ) {}

  async register(createUserDto: CreateUserDto, lang: string = 'en') {
    const existingUser = await this.userRepository.findOne({ where: { username: createUserDto.username } });
    if (existingUser) {
      throw new BadRequestException(await this.i18n.translate('auth.user_exists', { lang }));
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: createUserDto.role || 'user',
    });

    const savedUser = await this.userRepository.save(newUser);
    const payload = { id: savedUser.id, username: savedUser.username, role: savedUser.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role,
      },
      message: await this.i18n.translate('auth.register_success', { lang }),
    };
  }

  async login(username: string, password: string, lang: string = 'en') {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException(await this.i18n.translate('auth.user_not_found', { lang }));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(await this.i18n.translate('auth.invalid_password', { lang }));
    }

    const payload = { id: user.id, username: user.username, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      message: await this.i18n.translate('auth.login_success', { lang }),
    };
  }

  async addAdmin(createUserDto: CreateUserDto, lang: string = 'en') {
    const existingAdmin = await this.userRepository.findOne({ where: { username: createUserDto.username, role: 'admin' } });
    if (existingAdmin) {
      throw new BadRequestException(await this.i18n.translate('auth.admin_exists', { lang }));
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newAdmin = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: 'admin',
    });

    const savedAdmin = await this.userRepository.save(newAdmin);
    return {
      id: savedAdmin.id,
      username: savedAdmin.username,
      email: savedAdmin.email,
      role: savedAdmin.role,
      message: await this.i18n.translate('auth.admin_success', { lang }),
    };
  }
}