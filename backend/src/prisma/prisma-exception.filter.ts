import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from 'generated/prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  private readonly errorMap: Record<string, HttpStatus> = {
    P2002: HttpStatus.CONFLICT,
    P2025: HttpStatus.NOT_FOUND,
    P2003: HttpStatus.BAD_REQUEST,
    P2014: HttpStatus.BAD_REQUEST,
  };

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const status = this.errorMap[exception.code];

    if (!status) {
      return super.catch(exception, host);
    }

    const response = host.switchToHttp().getResponse<Response>();
    response.status(status).json({
      statusCode: status,
      message: HttpStatus[status].toLowerCase().replace(/_/g, ' '),
    });
  }
}
