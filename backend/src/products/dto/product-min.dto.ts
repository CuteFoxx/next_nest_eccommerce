import { Expose } from 'class-transformer';
import { Category } from 'generated/prisma/client';

export class ProductMinDto {
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
  category: Category;
}
