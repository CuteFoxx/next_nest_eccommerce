import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileService } from 'src/file/file.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { ReorderMenuDto } from './dto/reorder-menu.dto';
import { FilePurpose } from 'generated/prisma/enums';
import { File } from 'generated/prisma/client';

const MAX_DEPTH = 3;

const filterValuesInclude = {
  filterValues: {
    include: {
      attributeValue: {
        include: { attribute: true },
      },
    },
  },
} as const;

const itemInclude = {
  category: true,
  image: true,
  ...filterValuesInclude,
} as const;

@Injectable()
export class MenuService {
  constructor(
    private readonly prisma: PrismaService,
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

  private async getDepth(parentId: number): Promise<number> {
    let depth = 1;
    let currentParentId: number | null = parentId;
    while (currentParentId) {
      depth++;
      const parent = await this.prisma.menuItem.findUnique({
        where: { id: currentParentId },
        select: { parentId: true },
      });
      currentParentId = parent?.parentId ?? null;
    }
    return depth;
  }

  async findTree() {
    const roots = await this.prisma.menuItem.findMany({
      where: { parentId: null },
      orderBy: { position: 'asc' },
      include: {
        ...itemInclude,
        children: {
          orderBy: { position: 'asc' },
          include: {
            ...itemInclude,
            children: {
              orderBy: { position: 'asc' },
              include: itemInclude,
            },
          },
        },
      },
    });

    return roots.map((root) => ({
      ...this.withImageUrl(root),
      children: root.children.map((l2) => ({
        ...this.withImageUrl(l2),
        children: l2.children.map((l3) => this.withImageUrl(l3)),
      })),
    }));
  }

  async findAll() {
    const items = await this.prisma.menuItem.findMany({
      orderBy: { position: 'asc' },
      include: itemInclude,
    });
    return items.map((item) => this.withImageUrl(item));
  }

  async findOne(id: number) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: itemInclude,
    });
    if (!item) throw new NotFoundException('Menu item not found');
    return this.withImageUrl(item);
  }

  async create(
    dto: CreateMenuItemDto,
    file?: Express.Multer.File,
    userId?: number,
  ) {
    if (dto.parentId !== undefined) {
      const depth = await this.getDepth(dto.parentId);
      if (depth > MAX_DEPTH) {
        throw new BadRequestException(
          `Menu nesting cannot exceed ${MAX_DEPTH} levels`,
        );
      }
    }

    let uploadedFile: File | null = null;
    if (file && userId) {
      uploadedFile = await this.fileService.upload(
        file,
        { purpose: FilePurpose.MENU_IMAGE },
        userId,
      );
    }

    const position =
      dto.position ??
      (await this.prisma.menuItem
        .aggregate({
          _max: { position: true },
          where: { parentId: dto.parentId ?? null },
        })
        .then((r) => (r._max.position ?? -1) + 1));

    try {
      return await this.prisma.menuItem.create({
        data: {
          label: dto.label,
          type: dto.type,
          position,
          ...(dto.parentId !== undefined && {
            parent: { connect: { id: dto.parentId } },
          }),
          ...(dto.categoryId !== undefined && {
            category: { connect: { id: dto.categoryId } },
          }),
          url: dto.url,
          ...(dto.attributeValueIds?.length && {
            filterValues: {
              create: dto.attributeValueIds.map((id) => ({
                attributeValueId: id,
              })),
            },
          }),
          ...(uploadedFile && {
            image: { connect: { id: uploadedFile.id } },
          }),
        },
        include: itemInclude,
      });
    } catch (err) {
      if (uploadedFile) await this.fileService.delete(uploadedFile.id);
      throw err;
    }
  }

  async update(id: number, dto: UpdateMenuItemDto) {
    await this.findOne(id);

    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new BadRequestException(
          'A menu item cannot be its own parent',
        );
      }
      const depth = await this.getDepth(dto.parentId);
      if (depth > MAX_DEPTH) {
        throw new BadRequestException(
          `Menu nesting cannot exceed ${MAX_DEPTH} levels`,
        );
      }
    }

    return this.prisma.menuItem.update({
      where: { id },
      data: {
        ...(dto.label !== undefined && { label: dto.label }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.position !== undefined && { position: dto.position }),
        ...(dto.parentId !== undefined && {
          parent: { connect: { id: dto.parentId } },
        }),
        ...(dto.categoryId !== undefined && {
          category: { connect: { id: dto.categoryId } },
        }),
        ...(dto.url !== undefined && { url: dto.url }),
        ...(dto.attributeValueIds !== undefined && {
          filterValues: {
            deleteMany: {},
            create: dto.attributeValueIds.map((id) => ({
              attributeValueId: id,
            })),
          },
        }),
      },
      include: itemInclude,
    });
  }

  async reorder(dto: ReorderMenuDto) {
    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.menuItem.update({
          where: { id: item.id },
          data: {
            position: item.position,
            parentId: item.parentId ?? null,
          },
        }),
      ),
    );
    return this.findTree();
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.prisma.menuItem.delete({ where: { id } });
  }
}
