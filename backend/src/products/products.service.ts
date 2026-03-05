import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileService } from 'src/file/file.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Prisma } from 'generated/prisma/browser';
import { FilePurpose } from 'generated/prisma/enums';
import { generateSlug, uniqueSlug } from 'src/common/utils/slug';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { paginate } from 'src/common/dto/paginated.dto';

const productInclude = {
  images: { orderBy: { position: 'asc' as const }, include: { file: true } },
  attributeValues: {
    include: {
      attributeValue: {
        include: { attribute: true },
      },
    },
  },
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
      include: productInclude,
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findMany(
    where: Prisma.ProductWhereInput,
    { page, limit }: PaginationQueryDto,
    attributeFilters?: Record<string, string[]>,
  ) {
    if (attributeFilters && Object.keys(attributeFilters).length > 0) {
      const attrConditions = Object.entries(attributeFilters).map(
        ([attrSlug, valueSlugs]) => ({
          attributeValues: {
            some: {
              attributeValue: {
                attribute: { slug: attrSlug },
                slug: { in: valueSlugs },
              },
            },
          },
        }),
      );

      where = { ...where, AND: attrConditions };
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prismaService.product.findMany({
        where,
        include: productInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prismaService.product.count({ where }),
    ]);

    return paginate(data, total, page, limit);
  }

  async create(
    dto: CreateProductDto,
    files: Express.Multer.File[],
    userId: number,
  ) {
    const slug = await uniqueSlug(generateSlug(dto.name), (s) =>
      this.prismaService.product.count({
        where: {
          OR: [{ slug: s }, { slug: { startsWith: `${s}-` } }],
        },
      }),
    );

    const uploaded = await Promise.all(
      files.map((file) =>
        this.fileService.upload(
          file,
          { purpose: FilePurpose.PRODUCT_IMAGE },
          userId,
        ),
      ),
    );

    const { attributeValueIds, ...data } = dto;

    try {
      return await this.prismaService.product.create({
        data: {
          ...data,
          slug,
          ...(uploaded.length && {
            images: {
              create: uploaded.map((f, position) => ({
                fileId: f.id,
                position,
              })),
            },
          }),
          ...(attributeValueIds?.length && {
            attributeValues: {
              create: attributeValueIds.map((attributeValueId) => ({
                attributeValueId,
              })),
            },
          }),
        },
        include: productInclude,
      });
    } catch (err) {
      await Promise.allSettled(
        uploaded.map((f) => this.fileService.delete(f.id)),
      );
      throw err;
    }
  }

  async update(id: number, data: Partial<CreateProductDto>) {
    let slug: string | undefined;
    if (data.name) {
      slug = await uniqueSlug(generateSlug(data.name), (s) =>
        this.prismaService.product.count({
          where: {
            OR: [{ slug: s }, { slug: { startsWith: `${s}-` } }],
            NOT: { id },
          },
        }),
      );
    }

    return this.prismaService.product.update({
      where: { id },
      data: { ...data, ...(slug && { slug }) },
    });
  }

  delete(id: number) {
    return this.prismaService.product.delete({ where: { id } });
  }
}
