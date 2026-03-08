import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { MenuItemType } from 'generated/prisma/enums';

export class CreateMenuItemDto {
  @IsString()
  @MinLength(1)
  label: string;

  @IsEnum(MenuItemType)
  type: MenuItemType;

  @IsNumber()
  @IsOptional()
  position?: number;

  @Transform(({ value }) => (value === null ? undefined : Number(value)))
  @IsNumber()
  @IsOptional()
  parentId?: number;

  @Transform(({ value }) => (value === null ? undefined : Number(value)))
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  attributeValueIds?: number[];

  @IsString()
  @IsOptional()
  url?: string;
}
