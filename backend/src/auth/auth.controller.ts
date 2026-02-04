import {
  Controller,
  Post,
  UseGuards,
  Request,
  Bind,
  Body,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Request as ReqType } from 'express';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import { UserDto } from 'src/users/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @Bind(Request())
  login(@Request() req: ReqType) {
    if (!req.user) {
      throw new Error('User not found in request');
    }
    return this.authService.login(req.user);
  }

  @Post('signup')
  signup(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('profile')
  async getProfile(
    @Request() req: { user: { id: string; email: string } },
  ): Promise<UserDto | null> {
    const user = await this.usersService.findOne({ email: req.user.email });
    if (!user) {
      return null;
    }
    return user;
  }
}
