import { Module, forwardRef } from '@nestjs/common';
import { AppController } from './app.controller';
import { CoreModule } from './core/core.module';
import { getOrm } from './typeorm';
import { configuration } from './core';

@Module({
  imports: [CoreModule, forwardRef(() => getOrm(configuration))],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
