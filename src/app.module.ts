import { Module, DynamicModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { CoreModule } from './core/core.module';
import { DalModule } from './dal';

@Module({
  imports: [CoreModule, DalModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

  