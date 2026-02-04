import { Injectable, UseInterceptors } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { Prisma, Role, User } from 'generated/prisma/client';
import { JwtService } from '@nestjs/jwt';

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
  ) {}

  @UseInterceptors()
  async validateUser(
    where: Prisma.UserWhereUniqueInput,
    password: string,
  ): Promise<Partial<User> | null> {
    const user = await this.usersService.findOne(where);

    const isMatch = await bcrypt.compare(password, user?.password ?? '');
    if (user && isMatch) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  login(user: Partial<User>) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    } as Partial<JwtPayload>;
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
