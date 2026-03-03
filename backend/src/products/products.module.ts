import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { FileModule } from 'src/file/file.module';
import { AttributeModule } from 'src/attribute/attribute.module';

@Module({
  imports: [FileModule, AttributeModule],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
