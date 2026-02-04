import { Expose } from 'class-transformer';
import { Role } from 'generated/prisma/enums';

export class UserDto {
  @Expose()
  id: number;
  @Expose()
  email: string;
  @Expose()
  createdAt: Date;
  @Expose()
  role: Role;
}
