import { Module } from '@nestjs/common';
import { DalService } from './dal.service';

@Module({
  imports: [],
  providers: [DalService],
  exports: [DalService],
})
export class DalModule {}
