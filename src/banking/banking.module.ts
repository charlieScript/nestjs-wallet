import { Module } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { BANKING_SERVICE } from './interface';

@Module({
  providers: [
    {
      useClass: PaystackService,
      provide: BANKING_SERVICE,
    },
  ],
  exports: [
    {
      useClass: PaystackService,
      provide: BANKING_SERVICE,
    },
  ],
})
export class BankingModule {}
