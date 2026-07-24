const Institute = require('../models/Institute');
const User = require('../models/User');
const AppError = require('../utils/AppError');

exports.createInstitute = async (req, res, next) => {
  try {
    const institute = await Institute.create({ ...req.body, createdBy: req.userId });
    res.status(201).json({ success: true, data: institute, message: 'Institute created' });
  } catch (error) {
    next(error);
  }
};

exports.getInstitutes = async (req, res, next) => {
  try {
    const institutes = await Institute.find().populate('createdBy', 'name email');
    res.status(200).json({ success: true, count: institutes.length, data: institutes });
  } catch (error) {
    next(error);
  }
};

exports.getInstitute = async (req, res, next) => {
  try {
    const institute = await Institute.findById(req.params.id);
    if (!institute) return next(new AppError('Institute not found', 404));

    const stats = await Promise.all([
      User.countDocuments({ institute: req.params.id, role: 'student' }),
      User.countDocuments({ institute: req.params.id, role: { $in: ['mentor', 'admin'] } }),
      require('../models/Course').countDocuments({ institute: req.params.id }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...institute.toObject(),
        stats: { students: stats[0], mentors: stats[1], courses: stats[2] },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateInstitute = async (req, res, next) => {
  try {
    const institute = await Institute.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!institute) return next(new AppError('Institute not found', 404));
    res.status(200).json({ success: true, data: institute, message: 'Institute updated' });
  } catch (error) {
    next(error);
  }
};

exports.deleteInstitute = async (req, res, next) => {
  try {
    await Institute.findByIdAndDelete(req.params.id);
    await User.updateMany({ institute: req.params.id }, { $unset: { institute: '' } });
    res.status(200).json({ success: true, message: 'Institute deleted' });
  } catch (error) {
    next(error);
  }
};
