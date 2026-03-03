import { Expose, Transform, Type } from 'class-transformer';
import { ProductStatus } from 'generated/prisma/enums';

class ProductFileDto {
  @Expose()
  id: number;

  @Expose()
  @Transform(({ obj }: { obj: { key: string } }) => {
    const key = obj.key;
    if (key.startsWith('http')) return key;
    const base = process.env.STORAGE_BASE_URL;
    return base ? `${base}/${key}` : `/${key}`;
  })
  url: string;

  @Expose()
  alt: string | null;
}

class ProductImageDto {
  @Expose()
  position: number;

  @Expose()
  @Type(() => ProductFileDto)
  file: ProductFileDto;
}

interface RawProductAttributeValue {
  attributeValue: {
    name: string;
    slug: string;
    attribute: { name: string; slug: string };
  };
}

type GroupedAttributes = Record<
  string,
  { name: string; values: { name: string; slug: string }[] }
>;

function groupAttributes(raw: RawProductAttributeValue[]): GroupedAttributes {
  const grouped: GroupedAttributes = {};

  for (const { attributeValue } of raw) {
    const attr = attributeValue.attribute;
    if (!grouped[attr.slug]) {
      grouped[attr.slug] = { name: attr.name, values: [] };
    }
    grouped[attr.slug].values.push({
      name: attributeValue.name,
      slug: attributeValue.slug,
    });
  }

  return grouped;
}

export class ProductDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }: { value: string }) =>
    value == null ? value : Number(value),
  )
  price: number;

  @Expose()
  @Type(() => Number)
  @Transform(({ value }) => (value == null ? null : Number(value)))
  compareAtPrice: number | null;

  @Expose()
  stock: number;

  @Expose()
  status: ProductStatus;

  @Expose()
  categoryId: number | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => ProductImageDto)
  images: ProductImageDto[];

  @Expose()
  @Transform(
    ({ obj }: { obj: { attributeValues: RawProductAttributeValue[] } }) =>
      groupAttributes(obj.attributeValues ?? []),
  )
  attributes: GroupedAttributes;
}
