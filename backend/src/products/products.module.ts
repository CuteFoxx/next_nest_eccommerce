import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { FileModule } from 'src/file/file.module';

@Module({
  imports: [FileModule],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
