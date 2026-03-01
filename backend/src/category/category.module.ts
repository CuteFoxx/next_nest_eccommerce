import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { FileModule } from 'src/file/file.module';

@Module({
  imports: [FileModule],
  providers: [CategoryService],
  controllers: [CategoryController],
})
export class CategoryModule {}
