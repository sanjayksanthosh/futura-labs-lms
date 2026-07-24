const Joi = require('joi');

const questionSchema = Joi.object({
  question: Joi.string().required(),
  type: Joi.string().valid('mcq', 'true_false', 'short_answer', 'fill_blank', 'multiple_select').default('mcq'),
  options: Joi.array().items(Joi.string()).when('type', {
    is: Joi.string().valid('mcq', 'multiple_select'),
    then: Joi.array().items(Joi.string()).min(2).required(),
    otherwise: Joi.optional(),
  }),
  correctAnswer: Joi.any().required(),
  points: Joi.number().default(1),
  explanation: Joi.string().allow('', null),
  order: Joi.number().default(0),
});

const createQuizSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().allow('', null),
  course: Joi.string().allow('', null).optional(),
  module: Joi.string().allow('', null),
  lesson: Joi.string().allow('', null),
  questions: Joi.array().items(questionSchema).default([]),
  timeLimit: Joi.number().min(1).default(30),
  passingScore: Joi.number().min(0).default(40),
  maxAttempts: Joi.number().min(1).default(3),
  shuffleQuestions: Joi.boolean().default(false),
  showResults: Joi.boolean().default(true),
  dueDate: Joi.date().allow(null),
});

const submitQuizSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string().required(),
        selectedAnswer: Joi.any().required(),
      })
    )
    .min(1)
    .required(),
  timeTaken: Joi.number().default(0),
});

module.exports = { createQuizSchema, submitQuizSchema };
