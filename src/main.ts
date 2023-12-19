import { NestFactory } from '@nestjs/core';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as morgan from 'morgan';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { TransformInterceptor, configuration, validationPipeExceptionFactory } from './core';

const config = configuration();

const { UMS_PORT } = process.env;
const PORT = UMS_PORT || config.appPort;

async function createApp() {
  const appName = 'api';
  const logger = new Logger('main.createApp');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(appName, {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });
  // app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.use(morgan('combined'));
  app.enableCors({
    credentials: true,
    origin: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: validationPipeExceptionFactory,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());



  const options = new DocumentBuilder()
    .setTitle('Ukpor Wallet API')
    .setDescription('wallet system')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'Bearer', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/swagger', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(PORT);
  logger.log(`Listening on port: ${PORT} for the ${appName} app`);
}

createApp();
