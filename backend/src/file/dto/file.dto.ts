import { Expose } from 'class-transformer';
import { FilePurpose } from 'generated/prisma/enums';

export class FileDto {
  @Expose()
  id: number;

  @Expose()
  url: string;

  @Expose()
  filename: string;

  @Expose()
  mimeType: string;

  @Expose()
  size: number;

  @Expose()
  alt: string | null;

  @Expose()
  purpose: FilePurpose;

  @Expose()
  createdAt: Date;
}
