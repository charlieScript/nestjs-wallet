import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { configuration, validationSchema } from "./config";
import { WinstonModule } from "nest-winston";
const config = configuration();
const loggerConfig = config.logging;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    WinstonModule.forRoot(loggerConfig),
  ],
  providers: [
    
  ],
  exports: [
    
  ],
})
export class CoreModule {}
