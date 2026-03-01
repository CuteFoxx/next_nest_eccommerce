import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join, dirname, extname } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly basePath: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.basePath = this.configService.getOrThrow<string>('STORAGE_LOCAL_PATH');
    this.baseUrl = this.configService.get<string>('STORAGE_BASE_URL', '');
  }

  generateKey(file: Express.Multer.File): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const id = randomUUID().replace(/-/g, '');
    const ext = extname(file.originalname) || '.bin';
    return `uploads/${year}/${month}/${id}${ext}`;
  }

  async put(file: Express.Multer.File, key: string): Promise<void> {
    const fullPath = join(
      this.basePath,
      key.replace(
        `${this.configService.getOrThrow<string>('STORAGE_LOCAL_PATH')}/`,
        '',
      ),
    );
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, file.buffer);
  }

  async delete(key: string): Promise<void> {
    const fullPath = join(
      this.basePath,
      key.replace(
        `${this.configService.getOrThrow<string>('STORAGE_LOCAL_PATH')}/`,
        '',
      ),
    );
    await unlink(fullPath).catch(() => {});
  }

  getUrl(key: string): string {
    if (key.startsWith('http')) return key;
    return this.baseUrl ? `${this.baseUrl}/${key}` : `/${key}`;
  }
}
