import { Injectable, NotFoundException } from '@nestjs/common';
import { generateSlug, uniqueSlug } from 'src/common/utils/slug';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FileService } from 'src/file/file.service';
import { FilePurpose } from 'generated/prisma/enums';
import { File } from 'generated/prisma/client';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileService: FileService,
  ) {}

  private withImageUrl<T extends { image: File | null }>(entity: T) {
    if (!entity.image) return entity;
    return {
      ...entity,
      image: {
        ...entity.image,
        url: this.fileService.getUrl(entity.image.key),
      },
    };
  }

  async findOne(id: number) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
      include: { image: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return this.withImageUrl(category);
  }

  async findAll() {
    const categories = await this.prismaService.category.findMany({
      orderBy: { position: 'asc' },
      include: { image: true },
    });
    return categories.map((c) => this.withImageUrl(c));
  }

  async create(
    { parentId, name, position, ...rest }: CreateCategoryDto,
    file?: Express.Multer.File,
    userId?: number,
  ) {
    let uploadedFile: File | null = null;

    if (file && userId) {
      uploadedFile = await this.fileService.upload(
        file,
        { purpose: FilePurpose.CATEGORY_IMAGE },
        userId,
      );
      console.log('uploaded file ', uploadedFile);
    }

    const slug = await uniqueSlug(generateSlug(name), (s) =>
      this.prismaService.category.count({
        where: { OR: [{ slug: s }, { slug: { startsWith: `${s}-` } }] },
      }),
    );

    const resolvedPosition =
      position ??
      (await this.prismaService.category
        .aggregate({
          _max: { position: true },
          where: { parentId: parentId ?? null },
        })
        .then((r) => (r._max.position ?? -1) + 1));

    try {
      return await this.prismaService.category.create({
        data: {
          ...rest,
          name,
          slug,
          position: resolvedPosition,
          ...(parentId !== undefined && {
            parent: { connect: { id: parentId } },
          }),
          ...(uploadedFile && {
            image: { connect: { id: uploadedFile.id } },
          }),
        },
      });
    } catch (err) {
      if (uploadedFile) await this.fileService.delete(uploadedFile.id);
      throw err;
    }
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
