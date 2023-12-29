import * as dotenv from 'dotenv';
import * as path from 'path';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { LoggerOptions } from 'winston';

const ENV = process.env.NODE_ENV;

const dotenv_path = path.resolve(process.cwd(), !ENV ? '.env' : `.env.${ENV}`);
dotenv.config({ path: dotenv_path });

export const configuration = () => ({
  logging: {
    format: winston.format.uncolorize(),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          nestWinstonModuleUtilities.format.nestLike(),
        ),
      }),
    ],
  },
  database: {
    type: 'postgres',
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    migrationsRun: process.env.DB_MIGRATIONS_RUN,
    connection: process.env.DB_CONNECTION,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    logging: false,
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: false,
    entities: [path.join(__dirname, 'typeorm/entities/**/*.entity.{ts,js}')],
    migrations: [path.join(__dirname, 'src/typeorm/migrations/*.{ts,js}')],
    cli: {
      migrationsDir: 'src/typeorm/migrations',
      entitiesDir: 'typeorm/entities',
    },
  },
  paystack: {
    baseUrl: process.env.PAYSTACK_BASE_URL,
    secretKey: process.env.PAYSTACK_SECRET_KEY,
  },
  appName: process.env.APP_NAME,
  appPort: process.env.PORT,
});
