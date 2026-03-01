import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ProductStatus } from 'generated/prisma/enums';

export class CreateProductDto {
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  name: string;

  @IsString()
  @MinLength(10)
  @MaxLength(1500)
  description: string;

  @Transform(({ value }: { value: string }) => parseFloat(value))
  @IsNumber()
  price: number;

  @Transform(({ value }: { value: string }) =>
    value !== undefined ? parseFloat(value) : value,
  )
  @IsNumber()
  @IsOptional()
  compareAtPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }: { value: string }) =>
    value !== undefined ? parseInt(value) : value,
  )
  stock: number;

  @IsEnum(ProductStatus)
  @IsOptional()
  status: ProductStatus;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }: { value: string }) =>
    value !== undefined ? parseInt(value) : value,
  )
  categoryId?: number;
}
