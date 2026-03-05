import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { StorageService } from './storage.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileQueryDto } from './dto/file-query.dto';
import { paginate } from 'src/common/dto/paginated.dto';

@Injectable()
export class FileService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async upload(
    file: Express.Multer.File,
    dto: CreateFileDto,
    uploadedById: number,
  ) {
    const key = this.storageService.generateKey(file, dto.purpose);

    await this.storageService.put(file, key);

    try {
      const saved = await this.prismaService.file.create({
        data: {
          key,
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          alt: dto.alt ?? null,
          purpose: dto.purpose,
          uploadedById,
        },
      });

      return { ...saved, url: this.storageService.getUrl(saved.key) };
    } catch (err) {
      await this.storageService.delete(key);
      throw err;
    }
  }

  async findMany(query: FileQueryDto) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const where = query.purpose ? { purpose: query.purpose } : {};

    const [data, total] = await Promise.all([
      this.prismaService.file.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prismaService.file.count({ where }),
    ]);

    return paginate(
      data.map((f) => ({ ...f, url: this.storageService.getUrl(f.key) })),
      total,
      page,
      limit,
    );
  }

  async findOne(id: number) {
    const file = await this.prismaService.file.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    return { ...file, url: this.storageService.getUrl(file.key) };
  }

  async update(id: number, dto: UpdateFileDto) {
    await this.findOne(id);
    const updated = await this.prismaService.file.update({
      where: { id },
      data: dto,
    });
    return { ...updated, url: this.storageService.getUrl(updated.key) };
  }

  getUrl(key: string): string {
    return this.storageService.getUrl(key);
  }

  async delete(id: number) {
    const file = await this.findOne(id);

    await this.prismaService.file.delete({ where: { id } });
    await this.storageService.delete(file.key);
  }
}
