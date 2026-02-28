import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsNumber()
  @IsOptional()
  position: number;

  @IsNumber()
  @IsOptional()
  parentId?: number;
}
