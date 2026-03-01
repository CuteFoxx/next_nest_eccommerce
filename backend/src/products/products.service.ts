import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileService } from 'src/file/file.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Prisma } from 'generated/prisma/browser';
import { FilePurpose } from 'generated/prisma/enums';

const imagesInclude = {
  images: { orderBy: { position: 'asc' as const }, include: { file: true } },
};

@Injectable()
export class ProductsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async findOne(where: Prisma.ProductWhereInput) {
    const product = await this.prismaService.product.findFirst({
      where,
      include: imagesInclude,
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  //   TODO implement pagination
  async findMany(where: Prisma.ProductWhereInput) {
    return this.prismaService.product.findMany({
      where,
      include: imagesInclude,
    });
  }

  async create(
    dto: CreateProductDto,
    files: Express.Multer.File[],
    userId: number,
  ) {
    const uploaded = await Promise.all(
      files.map((file) =>
        this.fileService.upload(
          file,
          { purpose: FilePurpose.PRODUCT_IMAGE },
          userId,
        ),
      ),
    );

    try {
      return await this.prismaService.product.create({
        data: {
          ...dto,
          ...(uploaded.length && {
            images: {
              create: uploaded.map((f, position) => ({
                fileId: f.id,
                position,
              })),
            },
          }),
        },
        include: imagesInclude,
      });
    } catch (err) {
      await Promise.allSettled(
        uploaded.map((f) => this.fileService.delete(f.id)),
      );
      throw err;
    }
  }

  update(id: number, data: Partial<CreateProductDto>) {
    return this.prismaService.product.update({ where: { id }, data });
  }

  delete(id: number) {
    return this.prismaService.product.delete({ where: { id } });
  }
}
