import { User as PrismaUser } from 'generated/prisma/client';

declare global {
  namespace Express {
    type User = Pick<PrismaUser, 'id' | 'email' | 'role'>;
  }
}
