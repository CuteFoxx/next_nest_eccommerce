import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { ReorderMenuDto } from './dto/reorder-menu.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/auth/decorators/roles';
import { Role } from 'generated/prisma/enums';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { User } from 'generated/prisma/client';
import { CurrentUser } from 'src/auth/decorators/currentUser.decorator';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { MenuItemDto } from './dto/menu-item.dto';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('menu')
@Serialize(MenuItemDto)
@SkipThrottle({ auth: true })
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('tree')
  findTree() {
    return this.menuService.findTree();
  }

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll() {
    return this.menuService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateMenuItemDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 15 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /image\/(jpeg|png|webp)/ }),
        ],
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.menuService.create(dto, file, user.id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.menuService.update(id, dto);
  }

  @Put('reorder')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  reorder(@Body() dto: ReorderMenuDto) {
    return this.menuService.reorder(dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.delete(id);
  }
}
