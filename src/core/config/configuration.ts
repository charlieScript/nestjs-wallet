import * as dotenv from 'dotenv';
import * as path from 'path';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';

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
  drizzle: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT as unknown as number,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    migrationsPath: './src/dal/migrations',
  },
  appName: process.env.APP_NAME,
  appPort: process.env.PORT,
});
