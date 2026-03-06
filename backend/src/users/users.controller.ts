import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { SkipThrottle } from '@nestjs/throttler/dist/throttler.decorator';

@Controller('users')
@SkipThrottle({ auth: true })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
