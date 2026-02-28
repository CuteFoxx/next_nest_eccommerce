import { Expose } from 'class-transformer';
import { ProductStatus } from 'generated/prisma/enums';

export class ProductDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  price: number;

  @Expose()
  compareAtPrice?: number;

  @Expose()
  stock: number;

  @Expose()
  status: ProductStatus;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
