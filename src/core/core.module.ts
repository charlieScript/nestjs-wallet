import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { configuration, validationSchema } from "./config";
import { WinstonModule } from 'nest-winston';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    WinstonModule.forRoot(configuration().logging),
  ],
  providers: [],
  exports: [],
})
export class CoreModule {}
