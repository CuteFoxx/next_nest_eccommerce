import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDto } from './dto/product.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles';
import { CurrentUser } from 'src/auth/decorators/currentUser.decorator';
import { Role } from 'generated/prisma/enums';
import { User } from 'generated/prisma/browser';
import { AttributeService } from 'src/attribute/attribute.service';
import { AssignProductAttributesDto } from 'src/attribute/dto/assign-product-attributes.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { SkipThrottle } from '@nestjs/throttler/dist/throttler.decorator';

@Controller('products')
@SkipThrottle({ auth: true })
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly attributeService: AttributeService,
  ) {}

  @Get(':id')
  @Serialize(ProductDto)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne({ id });
  }

  @Get()
  @Serialize(ProductDto)
  findMany(
    @Query() pagination: PaginationQueryDto,
    @Query() query: Record<string, string>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { categoryId, page, limit, ...rest } = query;

    const where: Record<string, unknown> = {};
    if (categoryId) where.categoryId = parseInt(categoryId, 10);

    const attributeFilters: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (value)
        attributeFilters[key.toLowerCase()] = value
          .split(',')
          .map((v) => v.toLowerCase());
    }

    return this.productsService.findMany(
      where,
      pagination,
      Object.keys(attributeFilters).length ? attributeFilters : undefined,
    );
  }

  @Post()
  @Serialize(ProductDto)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FilesInterceptor('files', 10, { storage: memoryStorage() }))
  async create(
    @Body() dto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: User,
  ) {
    return this.productsService.create(dto, files ?? [], user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: Partial<CreateProductDto>,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.delete(id);
  }

  @Put(':id/attributes')
  @Serialize(ProductDto)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async setAttributes(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignProductAttributesDto,
  ) {
    await this.attributeService.setProductAttributes(id, dto.attributeValueIds);
    return this.productsService.findOne({ id });
  }

  @Get(':id/attributes')
  @Serialize(ProductDto)
  getAttributes(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne({ id });
  }
}
