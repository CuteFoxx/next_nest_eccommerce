import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';
import { FileModule } from './file/file.module';
import { AttributeModule } from './attribute/attribute.module';
import { MenuModule } from './menu/menu.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    AuthModule,
    ProductsModule,
    CategoryModule,
    FileModule,
    AttributeModule,
    MenuModule,
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 10000,
        limit: 100,
      },
      {
        name: 'auth',
        ttl: 300000,
        limit: 5,
      },
    ]),
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
