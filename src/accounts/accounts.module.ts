import { Module, forwardRef } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account, Transaction } from 'src/typeorm';
import { AccountsController } from './accounts.controller';
import { BankingModule } from 'src/banking/banking.module';

@Module({
  imports: [
    forwardRef(() => TypeOrmModule.forFeature([Account, Transaction])),
    BankingModule,
  ],
  providers: [AccountsService],
  controllers: [AccountsController],
})
export class AccountsModule {}
