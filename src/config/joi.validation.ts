import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  DB_PASSWORD: Joi.required(),
  DB_NAME: Joi.required(),
  DB_HOST: Joi.required(),
  DB_PORT: Joi.required().default(5432),
  DB_USERNAME: Joi.required(),
  HOST_API: Joi.required(),
  PORT: Joi.required().default(3000),
});
