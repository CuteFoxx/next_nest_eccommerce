import {
  Injectable,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { Prisma, Role, User } from 'generated/prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { Response } from 'express';
import { TokenPayload } from 'src/types/token-payload.interface';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export interface JwtPayload {
  username: string;
  sub: string;
  role: Role;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @UseInterceptors()
  async validateUser(where: Prisma.UserWhereUniqueInput, password: string) {
    try {
      const user = await this.usersService.findOne(where);

      const authenticated = await bcrypt.compare(
        password,
        user?.password ?? '',
      );
      if (!authenticated) {
        throw new UnauthorizedException('Not valid credentials');
      }
      return user;
    } catch {
      throw new UnauthorizedException('Not valid credentials');
    }
  }

  async login(user: User, response: Response) {
    const expiresIn = new Date();
    expiresIn.setSeconds(
      expiresIn.getSeconds() +
        parseInt(this.configService.getOrThrow<string>('JWT_EXPIRES_IN_S')),
    );

    const expiresInRefreshToken = new Date();
    expiresInRefreshToken.setSeconds(
      expiresInRefreshToken.getSeconds() +
        parseInt(
          this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN_S'),
        ),
    );

    const tokenPayload: TokenPayload = {
      userId: user.id.toString(),
    };

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: parseInt(
        this.configService.getOrThrow<string>('JWT_EXPIRES_IN_S'),
      ),
    });

    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: parseInt(
        this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN_S'),
      ),
    });

    await this.usersService.update(
      { id: user.id },
      { refreshToken: bcrypt.hashSync(refreshToken, 10) },
    );

    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresIn,
    });

    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresInRefreshToken,
    });

    return user;
  }

  async signup(user: CreateUserDto, response: Response) {
    const createdUser = await this.usersService.create(user);
    return this.login(createdUser, response);
  }

  async verifyRefreshToken(refreshToken: string, userId: string) {
    try {
      const user = await this.usersService.findOne({ id: parseInt(userId) });
      const authenticated = await bcrypt.compare(
        refreshToken,
        user?.refreshToken ?? '',
      );

      if (!authenticated) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return user;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: number, response: Response) {
    await this.usersService.update({ id: userId }, { refreshToken: null });

    response.clearCookie('Authentication');
    response.clearCookie('Refresh');
  }
}
