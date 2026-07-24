const Note = require('../models/Note');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

exports.getNotes = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.courseId) filter.course = req.query.courseId;
    if (req.query.moduleId) filter.module = req.query.moduleId;
    if (req.query.lessonId) filter.lesson = req.query.lessonId;
    if (req.query.topic) filter.topic = { $regex: req.query.topic, $options: 'i' };

    let query = Note.find(filter).populate('course', 'title');
    if (req.query.moduleId) query = query.populate('module', 'title');
    if (req.query.lessonId) query = query.populate('lesson', 'title');

    const features = new APIFeatures(query, req.query).sort().limitFields().paginate();
    const notes = await features.query;
    const total = await Note.countDocuments(features.query._conditions);
    const pagination = await features.getPaginationInfo(total);

    res.status(200).json({ success: true, count: notes.length, pagination, data: notes });
  } catch (error) {
    next(error);
  }
};

exports.getNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id).populate('course', 'title').populate('module', 'title').populate('lesson', 'title');
    if (!note) return next(new AppError('Note not found', 404));
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

exports.createNote = async (req, res, next) => {
  try {
    const note = await Note.create({ ...req.body, createdBy: req.userId });
    res.status(201).json({ success: true, data: note, message: 'Note created' });
  } catch (error) {
    next(error);
  }
};

exports.updateNote = async (req, res, next) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!note) return next(new AppError('Note not found', 404));
    res.status(200).json({ success: true, data: note, message: 'Note updated' });
  } catch (error) {
    next(error);
  }
};

exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return next(new AppError('Note not found', 404));
    res.status(200).json({ success: true, message: 'Note deleted' });
  } catch (error) {
    next(error);
  }
};
