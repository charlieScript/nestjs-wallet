"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configuration = void 0;
var dotenv = require("dotenv");
var path = require("path");
var nest_winston_1 = require("nest-winston");
var winston = require("winston");
var ENV = process.env.NODE_ENV;
var dotenv_path = path.resolve(process.cwd(), !ENV ? '.env' : ".env.".concat(ENV));
dotenv.config({ path: dotenv_path });
var configuration = function () { return ({
    logging: {
        format: winston.format.uncolorize(),
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(winston.format.timestamp(), winston.format.ms(), nest_winston_1.utilities.format.nestLike()),
            }),
        ],
    },
    drizzle: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DATABASE,
        migrationsPath: './src/dal/migrations'
    },
    appName: process.env.APP_NAME,
    appPort: process.env.PORT,
}); };
exports.configuration = configuration;
