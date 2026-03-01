import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { FilePurpose } from 'generated/prisma/enums';

export class UpdateFileDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  alt?: string;

  @IsEnum(FilePurpose)
  @IsOptional()
  purpose?: FilePurpose;
}
