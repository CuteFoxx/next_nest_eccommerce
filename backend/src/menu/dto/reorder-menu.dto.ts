import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';

class ReorderItemDto {
  @IsNumber()
  id: number;

  @IsNumber()
  position: number;

  @IsNumber()
  @IsOptional()
  parentId?: number | null;
}

export class ReorderMenuDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}
