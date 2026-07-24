const Joi = require('joi');

const lessonContentSchema = Joi.object({
  videoUrl: Joi.string().allow('', null),
  videoDuration: Joi.number().default(0),
  pdfUrl: Joi.string().allow('', null),
  documentUrl: Joi.string().allow('', null),
  textContent: Joi.string().allow('', null),
  audioUrl: Joi.string().allow('', null),
  externalLinks: Joi.array().items(Joi.object({ title: Joi.string(), url: Joi.string() })),
}).default({});

const lessonInCourseSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow('', null),
  order: Joi.number().min(0).default(0),
  contentType: Joi.string().valid('video', 'pdf', 'document', 'quiz', 'assignment', 'audio', 'image', 'text').default('video'),
  content: lessonContentSchema,
  isFree: Joi.boolean().truthy('on', 'true', '1').falsy('off', 'false', '0', '').default(false),
  duration: Joi.number().default(0),
});

const moduleInCourseSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow('', null),
  order: Joi.number().min(0).default(0),
  lessons: Joi.array().items(lessonInCourseSchema).default([]),
});

const createCourseSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().allow('', null),
  shortDescription: Joi.string().max(200).allow('', null),
  category: Joi.string().allow('', null),
  level: Joi.string().valid('beginner', 'intermediate', 'advanced', 'all').default('beginner'),
  language: Joi.string().allow('', null),
  price: Joi.number().min(0).default(0),
  isFree: Joi.boolean().truthy('on', 'true', '1').falsy('off', 'false', '0', '').default(true),
  thumbnail: Joi.string().allow('', null),
  tags: Joi.array().items(Joi.string()),
  learningObjectives: Joi.array().items(Joi.string()),
  prerequisites: Joi.array().items(Joi.string()),
  modules: Joi.array().items(moduleInCourseSchema).default([]),
});

const updateCourseSchema = Joi.object({
  title: Joi.string().min(3).max(200),
  description: Joi.string().allow('', null),
  shortDescription: Joi.string().max(200).allow('', null),
  category: Joi.string().allow('', null),
  level: Joi.string().valid('beginner', 'intermediate', 'advanced', 'all'),
  price: Joi.number().min(0),
  isFree: Joi.boolean(),
  status: Joi.string().valid('draft', 'published', 'archived'),
  tags: Joi.array().items(Joi.string()),
  learningObjectives: Joi.array().items(Joi.string()),
  prerequisites: Joi.array().items(Joi.string()),
  thumbnail: Joi.string().allow('', null),
});

const createModuleSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow('', null),
  order: Joi.number().min(0).default(0),
});

const createLessonSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow('', null),
  order: Joi.number().min(0).default(0),
  contentType: Joi.string()
    .valid('video', 'pdf', 'document', 'quiz', 'assignment', 'audio', 'image', 'text')
    .default('video'),
  content: Joi.object({
    videoUrl: Joi.string().allow('', null),
    videoDuration: Joi.number().default(0),
    pdfUrl: Joi.string().allow('', null),
    documentUrl: Joi.string().allow('', null),
    textContent: Joi.string().allow('', null),
    audioUrl: Joi.string().allow('', null),
    externalLinks: Joi.array().items(Joi.object({ title: Joi.string(), url: Joi.string() })),
  }).default({}),
  isFree: Joi.boolean().truthy('on', 'true', '1').falsy('off', 'false', '0', '').default(false),
  duration: Joi.number().default(0),
});

module.exports = { createCourseSchema, updateCourseSchema, createModuleSchema, createLessonSchema };
