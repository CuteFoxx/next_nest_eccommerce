import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AttributeService } from './attribute.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { CreateAttributeValueDto } from './dto/create-attribute-value.dto';
import { UpdateAttributeValueDto } from './dto/update-attribute-value.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles';
import { Role } from 'generated/prisma/enums';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { AttributeDto } from './dto/attribute.dto';
import { CategoryFilterDto } from './dto/category-filters.dto';

@Controller('attributes')
export class AttributeController {
  constructor(private readonly attributeService: AttributeService) {}

  @Post()
  @Serialize(AttributeDto)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateAttributeDto) {
    return this.attributeService.createAttribute(dto);
  }

  @Get()
  @Serialize(AttributeDto)
  findAll() {
    return this.attributeService.findAllAttributes();
  }

  @Get(':id')
  @Serialize(AttributeDto)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.attributeService.findOneAttribute(id);
  }

  @Patch(':id')
  @Serialize(AttributeDto)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAttributeDto,
  ) {
    return this.attributeService.updateAttribute(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.attributeService.deleteAttribute(id);
  }

  @Post(':attributeId/values')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createValue(
    @Param('attributeId', ParseIntPipe) attributeId: number,
    @Body() dto: CreateAttributeValueDto,
  ) {
    return this.attributeService.createValue(attributeId, dto);
  }

  @Get(':attributeId/values')
  findValues(@Param('attributeId', ParseIntPipe) attributeId: number) {
    return this.attributeService.findValuesByAttribute(attributeId);
  }

  @Patch('values/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateValue(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAttributeValueDto,
  ) {
    return this.attributeService.updateValue(id, dto);
  }

  @Delete('values/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  deleteValue(@Param('id', ParseIntPipe) id: number) {
    return this.attributeService.deleteValue(id);
  }

  @Get('categories/:categoryId/filters')
  @Serialize(CategoryFilterDto)
  getCategoryFilters(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.attributeService.getCategoryFilters(categoryId);
  }
}
