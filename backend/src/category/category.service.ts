import { Injectable, NotFoundException } from '@nestjs/common';
import { generateSlug, uniqueSlug } from 'src/common/utils/slug';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async findOne(id: number) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  findAll() {
    return this.prismaService.category.findMany({
      orderBy: { position: 'asc' },
    });
  }

  async create({ parentId, name, ...rest }: CreateCategoryDto) {
    const slug = await uniqueSlug(generateSlug(name), (s) =>
      this.prismaService.category.count({
        where: { OR: [{ slug: s }, { slug: { startsWith: `${s}-` } }] },
      }),
    );

    return this.prismaService.category.create({
      data: {
        ...rest,
        name,
        slug,
        ...(parentId !== undefined && {
          parent: { connect: { id: parentId } },
        }),
      },
    });
  }

  async update(id: number, { parentId, name, ...rest }: UpdateCategoryDto) {
    await this.findOne(id);

    let slug: string | undefined;
    if (name) {
      slug = await uniqueSlug(generateSlug(name), (s) =>
        this.prismaService.category.count({
          where: {
            OR: [{ slug: s }, { slug: { startsWith: `${s}-` } }],
            NOT: { id },
          },
        }),
      );
    }

    return this.prismaService.category.update({
      where: { id },
      data: {
        ...rest,
        ...(name && { name, slug }),
        ...(parentId !== undefined && {
          parent: { connect: { id: parentId } },
        }),
      },
    });
  }

  delete(id: number) {
    return this.prismaService.category.delete({ where: { id } });
  }
}
