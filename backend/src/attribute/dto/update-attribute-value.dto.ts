import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAttributeValueDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  position?: number;
}
