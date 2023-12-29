import { Module } from '@nestjs/common';
import { PaystackService } from './paystack.service';

@Module({
  providers: [PaystackService],
  exports: [],
})
export class BankingModule {}
