import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(10)
  @IsOptional()
  description: string;

  @IsNumber()
  @IsOptional()
  position: number;

  @Transform(({ value }) => (value === null ? undefined : Number(value)))
  @IsNumber()
  @IsOptional()
  parentId?: number;
}
