import { IsEnum, IsOptional } from 'class-validator';
import { FilePurpose } from 'generated/prisma/enums';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class FileQueryDto extends PaginationQueryDto {
  @IsEnum(FilePurpose)
  @IsOptional()
  purpose?: FilePurpose;
}
