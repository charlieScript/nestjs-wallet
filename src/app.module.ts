import { Module, forwardRef } from '@nestjs/common';
import { AppController } from './app.controller';
import { CoreModule } from './core/core.module';
import { getOrm } from './typeorm';
import { configuration } from './core';
import { AccountsModule } from './accounts/accounts.module';

@Module({
  imports: [CoreModule, forwardRef(() => getOrm(configuration)), AccountsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
