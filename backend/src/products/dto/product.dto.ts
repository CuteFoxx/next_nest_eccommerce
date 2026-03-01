import { Expose, Transform, Type } from 'class-transformer';
import { ProductStatus } from 'generated/prisma/enums';
import { FileDto } from 'src/file/dto/file.dto';

class ProductImageDto {
  @Expose()
  position: number;

  @Expose()
  @Type(() => FileDto)
  file: FileDto;
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
}
