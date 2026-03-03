import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAttributeDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  position?: number;
}
