import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { FileModule } from 'src/file/file.module';

@Module({
  imports: [FileModule],
  providers: [MenuService],
  controllers: [MenuController],
})
export class MenuModule {}
