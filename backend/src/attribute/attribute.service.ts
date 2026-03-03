import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { CreateAttributeValueDto } from './dto/create-attribute-value.dto';
import { UpdateAttributeValueDto } from './dto/update-attribute-value.dto';
import { generateSlug, uniqueSlug } from 'src/common/utils/slug';

@Injectable()
export class AttributeService {
  constructor(private readonly prisma: PrismaService) {}

  async createAttribute({ name, position, ...rest }: CreateAttributeDto) {
    const slug = await uniqueSlug(generateSlug(name), (s) =>
      this.prisma.attribute.count({
        where: { OR: [{ slug: s }, { slug: { startsWith: `${s}-` } }] },
      }),
    );

    const resolvedPosition =
      position ??
      (await this.prisma.attribute
        .aggregate({ _max: { position: true } })
        .then((r) => (r._max.position ?? -1) + 1));

    return this.prisma.attribute.create({
      data: { ...rest, name, slug, position: resolvedPosition },
    });
  }

  findAllAttributes() {
    return this.prisma.attribute.findMany({
      orderBy: { position: 'asc' },
      include: { values: { orderBy: { position: 'asc' } } },
    });
  }

  async findOneAttribute(id: number) {
    const attribute = await this.prisma.attribute.findUnique({
      where: { id },
      include: { values: { orderBy: { position: 'asc' } } },
    });
    if (!attribute) throw new NotFoundException('Attribute not found');
    return attribute;
  }

  async updateAttribute(id: number, { name, ...rest }: UpdateAttributeDto) {
    await this.findOneAttribute(id);

    let slug: string | undefined;
    if (name) {
      slug = await uniqueSlug(generateSlug(name), (s) =>
        this.prisma.attribute.count({
          where: {
            OR: [{ slug: s }, { slug: { startsWith: `${s}-` } }],
            NOT: { id },
          },
        }),
      );
    }

    return this.prisma.attribute.update({
      where: { id },
      data: { ...rest, ...(name && { name, slug }) },
      include: { values: { orderBy: { position: 'asc' } } },
    });
  }

  async deleteAttribute(id: number) {
    await this.findOneAttribute(id);
    return this.prisma.attribute.delete({ where: { id } });
  }

  async createValue(
    attributeId: number,
    { name, position }: CreateAttributeValueDto,
  ) {
    await this.findOneAttribute(attributeId);

    const slug = await uniqueSlug(generateSlug(name), (s) =>
      this.prisma.attributeValue.count({
        where: {
          attributeId,
          OR: [{ slug: s }, { slug: { startsWith: `${s}-` } }],
        },
      }),
    );

    const resolvedPosition =
      position ??
      (await this.prisma.attributeValue
        .aggregate({
          _max: { position: true },
          where: { attributeId },
        })
        .then((r) => (r._max.position ?? -1) + 1));

    return this.prisma.attributeValue.create({
      data: { attributeId, name, slug, position: resolvedPosition },
    });
  }

  async findValuesByAttribute(attributeId: number) {
    await this.findOneAttribute(attributeId);
    return this.prisma.attributeValue.findMany({
      where: { attributeId },
      orderBy: { position: 'asc' },
    });
  }

  async updateValue(id: number, { name, ...rest }: UpdateAttributeValueDto) {
    const value = await this.prisma.attributeValue.findUnique({
      where: { id },
    });
    if (!value) throw new NotFoundException('Attribute value not found');

    let slug: string | undefined;
    if (name) {
      slug = await uniqueSlug(generateSlug(name), (s) =>
        this.prisma.attributeValue.count({
          where: {
            attributeId: value.attributeId,
            OR: [{ slug: s }, { slug: { startsWith: `${s}-` } }],
            NOT: { id },
          },
        }),
      );
    }

    return this.prisma.attributeValue.update({
      where: { id },
      data: { ...rest, ...(name && { name, slug }) },
    });
  }

  async deleteValue(id: number) {
    const value = await this.prisma.attributeValue.findUnique({
      where: { id },
    });
    if (!value) throw new NotFoundException('Attribute value not found');
    return this.prisma.attributeValue.delete({ where: { id } });
  }

  async setProductAttributes(productId: number, attributeValueIds: number[]) {
    await this.prisma.$transaction([
      this.prisma.productAttributeValue.deleteMany({ where: { productId } }),
      ...(attributeValueIds.length
        ? [
            this.prisma.productAttributeValue.createMany({
              data: attributeValueIds.map((attributeValueId) => ({
                productId,
                attributeValueId,
              })),
            }),
          ]
        : []),
    ]);

    return this.getProductAttributes(productId);
  }

  getProductAttributes(productId: number) {
    return this.prisma.productAttributeValue.findMany({
      where: { productId },
      include: { attributeValue: { include: { attribute: true } } },
    });
  }

  async getCategoryFilters(categoryId: number) {
    const values = await this.prisma.attributeValue.findMany({
      where: {
        productAttributeValues: {
          some: { product: { categoryId } },
        },
      },
      include: {
        attribute: true,
        _count: {
          select: {
            productAttributeValues: {
              where: { product: { categoryId } },
            },
          },
        },
      },
      orderBy: { position: 'asc' },
    });

    const groupMap = new Map<
      number,
      {
        id: number;
        name: string;
        slug: string;
        values: {
          id: number;
          name: string;
          slug: string;
          productCount: number;
        }[];
      }
    >();

    for (const v of values) {
      const attr = v.attribute;
      if (!groupMap.has(attr.id)) {
        groupMap.set(attr.id, {
          id: attr.id,
          name: attr.name,
          slug: attr.slug,
          values: [],
        });
      }
      groupMap.get(attr.id)!.values.push({
        id: v.id,
        name: v.name,
        slug: v.slug,
        productCount: v._count.productAttributeValues,
      });
    }

    return Array.from(groupMap.values());
  }
}
