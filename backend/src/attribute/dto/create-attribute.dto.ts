import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAttributeDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsNumber()
  @IsOptional()
  position?: number;
}
