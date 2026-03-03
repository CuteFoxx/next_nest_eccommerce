import { IsArray, IsInt } from 'class-validator';

export class AssignProductAttributesDto {
  @IsArray()
  @IsInt({ each: true })
  attributeValueIds: number[];
}
