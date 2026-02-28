import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Prisma } from 'generated/prisma/browser';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findOne(where: Prisma.ProductWhereInput) {
    const product = await this.prismaService.product.findFirst({ where });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  //   TODO implement pagination
  async findMany(where: Prisma.ProductWhereInput) {
    return this.prismaService.product.findMany({
      where,
    });
  }

  create(data: CreateProductDto) {
    return this.prismaService.product.create({
      data,
    });
  }

  update(id: number, data: Partial<CreateProductDto>) {
    return this.prismaService.product.update({
      where: { id },
      data,
    });
  }

  delete(id: number) {
    return this.prismaService.product.delete({
      where: { id },
    });
  }
}
