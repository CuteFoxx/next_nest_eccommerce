import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { FilePurpose } from 'generated/prisma/enums';

export class FileQueryDto {
  @IsEnum(FilePurpose)
  @IsOptional()
  purpose?: FilePurpose;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 24;
}
