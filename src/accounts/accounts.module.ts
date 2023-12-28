import { Module, forwardRef } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account, Transaction } from 'src/typeorm';
import { AccountsController } from './accounts.controller';

@Module({
  imports: [
    forwardRef(() =>
      TypeOrmModule.forFeature([
        Account,
        Transaction,
      ]),
    ),
  ],
  providers: [AccountsService],
  controllers: [AccountsController],
})
export class AccountsModule {}
