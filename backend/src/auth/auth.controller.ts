import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Get,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import { UserDto } from 'src/users/dto/user.dto';
import { CurrentUser } from './decorators/currentUser.decorator';
import { User } from 'generated/prisma/browser';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh.auth.guard';

@Controller('auth')
@Serialize(UserDto)
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(@CurrentUser() user: User, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(user, res);
  }

  @Post('signup')
  signup(
    @Body() body: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signup(body, res);
  }

  @UseGuards(JwtAuthGuard)
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

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  refresh(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(user, res);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@CurrentUser() user: User, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(user.id, res);
  }
}
