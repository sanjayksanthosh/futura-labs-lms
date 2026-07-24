const Joi = require('joi');

const createAssignmentSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().allow('', null),
  instructions: Joi.string().allow('', null),
  course: Joi.string().required(),
  module: Joi.string().allow('', null),
  lesson: Joi.string().allow('', null),
  mentor: Joi.string().allow('', null),
  type: Joi.string().valid('text', 'file_upload', 'quiz', 'coding', 'presentation').default('file_upload'),
  totalPoints: Joi.number().min(1).default(100),
  passingPoints: Joi.number().min(0).default(40),
  dueDate: Joi.date().greater('now').required(),
  isPublished: Joi.boolean().truthy('on', 'true', '1').falsy('off', 'false', '0', '').default(true),
  allowLateSubmission: Joi.boolean().default(false),
  lateSubmissionPenalty: Joi.number().min(0).default(0),
  maxAttempts: Joi.number().min(1).default(1),
  rubric: Joi.array().items(
    Joi.object({
      criterion: Joi.string().required(),
      points: Joi.number().required(),
      description: Joi.string().allow('', null),
    })
  ),
});

const gradeSubmissionSchema = Joi.object({
  score: Joi.number().min(0).required(),
  maxScore: Joi.number().min(0),
  feedback: Joi.string().allow('', null),
  status: Joi.string().valid('graded', 'returned'),
});

module.exports = { createAssignmentSchema, gradeSubmissionSchema };
