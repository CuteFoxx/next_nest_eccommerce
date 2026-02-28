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

  @IsNumber()
  price: number;

  @IsNumber()
  @IsOptional()
  compareAtPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stock: number;

  @IsEnum(ProductStatus)
  @IsOptional()
  status: ProductStatus;

  @IsNumber()
  @IsOptional()
  categoryId?: number;
}
