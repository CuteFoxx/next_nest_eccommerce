import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User } from '../../generated/prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findOne(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.prismaService.user.findUnique({ where });
  }

  async create(data: CreateUserDto) {
    const passwordHash = await hash(data.password, 10);

    return this.prismaService.user.create({
      data: {
        email: data.email,
        password: passwordHash,
      },
    });
  }

  async update(where: Prisma.UserWhereUniqueInput, data: CreateUserDto) {
    const user = await this.prismaService.user.findUnique({ where });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, data);

    return this.prismaService.user.update({
      data: user,
      where,
    });
  }

  async delete(where: Prisma.UserWhereUniqueInput) {
    return this.prismaService.user.delete({ where });
  }
}
