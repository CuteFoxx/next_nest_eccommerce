import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @MinLength(3)
  @IsOptional()
  name?: string;

  @IsString()
  @MinLength(10)
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  position?: number;

  @IsNumber()
  @IsOptional()
  parentId?: number;
}
