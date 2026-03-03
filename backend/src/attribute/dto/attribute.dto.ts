import { Expose, Type } from 'class-transformer';

export class AttributeValueDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  position: number;
}

export class AttributeDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  position: number;

  @Expose()
  @Type(() => AttributeValueDto)
  values?: AttributeValueDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
