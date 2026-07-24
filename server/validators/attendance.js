const Joi = require('joi');

const markAttendanceSchema = Joi.object({
  student: Joi.string().required(),
  course: Joi.string(),
  batch: Joi.string(),
  date: Joi.date().required(),
  status: Joi.string().valid('present', 'absent', 'late', 'excused').default('present'),
  notes: Joi.string().allow('', null),
});

const bulkAttendanceSchema = Joi.object({
  batch: Joi.string().required(),
  course: Joi.string(),
  date: Joi.date().required(),
  records: Joi.array()
    .items(
      Joi.object({
        student: Joi.string().required(),
        status: Joi.string().valid('present', 'absent', 'late', 'excused').required(),
        notes: Joi.string().allow('', null),
      })
    )
    .min(1)
    .required(),
});

module.exports = { markAttendanceSchema, bulkAttendanceSchema };
