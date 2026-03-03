import { Expose, Type } from 'class-transformer';

export class FilterValueDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  productCount: number;
}

export class CategoryFilterDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  @Type(() => FilterValueDto)
  values: FilterValueDto[];
}
