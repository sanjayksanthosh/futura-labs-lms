const Batch = require('../models/Batch');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

exports.createBatch = async (req, res, next) => {
  try {
    const batch = await Batch.create({ ...req.body, createdBy: req.userId });
    res.status(201).json({ success: true, data: batch, message: 'Batch created' });
  } catch (error) {
    next(error);
  }
};

exports.getBatches = async (req, res, next) => {
  try {
    const features = new APIFeatures(
      Batch.find().populate('mentor', 'name email').populate('courses', 'title'),
      req.query
    )
      .filter()
      .search(['name', 'code'])
      .sort()
      .paginate();

    const batches = await features.query;
    const total = await Batch.countDocuments(features.query._conditions);
    const pagination = await features.getPaginationInfo(total);

    res.status(200).json({ success: true, count: batches.length, pagination, data: batches });
  } catch (error) {
    next(error);
  }
};

exports.getBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('mentor', 'name email avatar')
      .populate('courses', 'title slug')
      .populate('students', 'name email avatar');
    if (!batch) return next(new AppError('Batch not found', 404));
    res.status(200).json({ success: true, data: batch });
  } catch (error) {
    next(error);
  }
};

exports.updateBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!batch) return next(new AppError('Batch not found', 404));
    res.status(200).json({ success: true, data: batch, message: 'Batch updated' });
  } catch (error) {
    next(error);
  }
};

exports.deleteBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findByIdAndDelete(req.params.id);
    if (!batch) return next(new AppError('Batch not found', 404));
    await User.updateMany({ batch: batch._id }, { $unset: { batch: '' } });
    res.status(200).json({ success: true, message: 'Batch deleted' });
  } catch (error) {
    next(error);
  }
};

exports.addStudentsToBatch = async (req, res, next) => {
  try {
    const { studentIds } = req.body;
    const batch = await Batch.findById(req.params.id);
    if (!batch) return next(new AppError('Batch not found', 404));

    for (const id of studentIds) {
      if (!batch.students.includes(id)) {
        batch.students.push(id);
        await User.findByIdAndUpdate(id, { batch: batch._id });
      }
    }
    await batch.save();

    res.status(200).json({ success: true, data: batch, message: 'Students added to batch' });
  } catch (error) {
    next(error);
  }
};

exports.removeStudentFromBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return next(new AppError('Batch not found', 404));

    batch.students.pull(req.params.studentId);
    await batch.save();
    await User.findByIdAndUpdate(req.params.studentId, { $unset: { batch: '' } });

    res.status(200).json({ success: true, data: batch, message: 'Student removed from batch' });
  } catch (error) {
    next(error);
  }
};
