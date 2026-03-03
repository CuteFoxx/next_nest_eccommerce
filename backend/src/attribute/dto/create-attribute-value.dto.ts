import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAttributeValueDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsNumber()
  @IsOptional()
  position?: number;
}
