import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Logger } from '@nestjs/common/services';

@Injectable()
export class ErrorHandleService {
  handleDBExpections(error: any, logger: Logger) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    logger.error(error);
    throw new InternalServerErrorException(
      'Unexcpected error, check server logs',
    );
  }
}
