import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseFilePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileQueryDto } from './dto/file-query.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles';
import { CurrentUser } from 'src/auth/decorators/currentUser.decorator';
import { Role } from 'generated/prisma/enums';
import { FileService } from './file.service';
import { User } from 'generated/prisma/browser';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { FileDto } from './dto/file.dto';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get()
  findMany(@Query() query: FileQueryDto) {
    return this.fileService.findMany(query);
  }

  @Get(':id')
  @Serialize(FileDto)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fileService.findOne(id);
  }

  @Post()
  @Serialize(FileDto)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 15 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /image\/(jpeg|png|webp)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() createFileDto: CreateFileDto,
    @CurrentUser() user: User,
  ) {
    return this.fileService.upload(file, createFileDto, user.id);
  }

  @Patch(':id')
  @Serialize(FileDto)
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFileDto: UpdateFileDto,
  ) {
    return this.fileService.update(id, updateFileDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.fileService.delete(id);
  }
}
