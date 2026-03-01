import { Expose, Transform } from 'class-transformer';
import { FilePurpose } from 'generated/prisma/enums';

export class FileDto {
  @Expose()
  id: number;

  @Expose()
  @Transform(({ obj }: { obj: { key: string } }) => {
    const key = obj.key;
    if (key.startsWith('http')) return key;
    const base = process.env.STORAGE_BASE_URL;
    return base ? `${base}/${key}` : `/${key}`;
  })
  url: string;

  @Expose()
  alt: string | null;

  @Expose()
  purpose: FilePurpose;
}
