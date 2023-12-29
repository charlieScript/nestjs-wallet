import { Module, forwardRef } from '@nestjs/common';
import { AppController } from './app.controller';
import { CoreModule } from './core/core.module';
import { getOrm } from './typeorm';
import { configuration } from './core';
import { AccountsModule } from './accounts/accounts.module';
import { BankingModule } from './banking/banking.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [CoreModule, forwardRef(() => getOrm(configuration)), AccountsModule, BankingModule, UsersModule, AuthModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
