import { Expose } from 'class-transformer';

export class CategoryDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  description: string;

  @Expose()
  position: number;

  @Expose()
  parentId?: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
