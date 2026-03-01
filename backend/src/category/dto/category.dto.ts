import { Expose, Type } from 'class-transformer';

class CategoryImageDto {
  @Expose()
  id: number;

  @Expose()
  url: string;

  @Expose()
  alt?: string;
}

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
  @Type(() => CategoryImageDto)
  image?: CategoryImageDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
