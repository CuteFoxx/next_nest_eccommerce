import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { StorageService } from './storage.service';

@Module({
  imports: [ConfigModule],
  providers: [FileService, StorageService],
  controllers: [FileController],
  exports: [FileService],
})
export class FileModule {}
