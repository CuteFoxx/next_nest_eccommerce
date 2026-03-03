import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';
import { FileModule } from './file/file.module';
import { AttributeModule } from './attribute/attribute.module';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    AuthModule,
    ProductsModule,
    CategoryModule,
    FileModule,
    AttributeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
