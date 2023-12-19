import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .default('test')
    .valid('development', 'production', 'staging', 'test')
    .required(),
  PORT: Joi.number().default(3000),
  JWT_SECRET: Joi.string().required(),
  ORIGIN: Joi.string().required(),
  APP_NAME: Joi.string().required(),
});
