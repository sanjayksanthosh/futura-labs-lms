const Joi = require('joi');

const createBatchSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().allow('', null),
  mentor: Joi.string().required(),
  courses: Joi.array().items(Joi.string()),
  students: Joi.array().items(Joi.string()),
  maxStudents: Joi.number().min(1).default(50),
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref('startDate')),
  schedule: Joi.object({
    days: Joi.array().items(Joi.string()),
    startTime: Joi.string(),
    endTime: Joi.string(),
  }),
});

module.exports = { createBatchSchema };
