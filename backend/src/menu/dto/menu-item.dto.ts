import { Expose, Type } from 'class-transformer';

class MenuItemImageDto {
  @Expose()
  id: number;

  @Expose()
  url: string;

  @Expose()
  alt?: string;
}

class MenuItemCategoryDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  slug: string;
}

class FilterAttributeDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  slug: string;
}

class FilterAttributeValueDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  @Type(() => FilterAttributeDto)
  attribute: FilterAttributeDto;
}

class MenuItemFilterValueDto {
  @Expose()
  @Type(() => FilterAttributeValueDto)
  attributeValue: FilterAttributeValueDto;
}

export class MenuItemDto {
  @Expose()
  id: number;

  @Expose()
  label: string;

  @Expose()
  type: string;

  @Expose()
  position: number;

  @Expose()
  parentId?: number;

  @Expose()
  categoryId?: number;

  @Expose()
  url?: string;

  @Expose()
  @Type(() => MenuItemCategoryDto)
  category?: MenuItemCategoryDto;

  @Expose()
  @Type(() => MenuItemImageDto)
  image?: MenuItemImageDto;

  @Expose()
  @Type(() => MenuItemFilterValueDto)
  filterValues?: MenuItemFilterValueDto[];

  @Expose()
  @Type(() => MenuItemDto)
  children?: MenuItemDto[];
}
