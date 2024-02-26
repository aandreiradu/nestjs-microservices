import * as Joi from 'joi';

export const createCBRecord = Joi.object({
  SSN: Joi.string().required().length(13),
  fullName: Joi.string().required().min(3),
  creditScore: Joi.number().required().min(0),
});
