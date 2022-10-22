import { Module } from '@nestjs/common';
import { ErrorHandleService } from './services/error-handle.service';

@Module({
  controllers: [],
  providers: [ErrorHandleService],
  exports: [ErrorHandleService],
})
export class CommonModule {}
