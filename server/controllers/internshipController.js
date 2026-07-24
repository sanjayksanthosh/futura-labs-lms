const Internship = require('../models/Internship');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

exports.createInternship = async (req, res, next) => {
  try {
    const internship = await Internship.create({
      ...req.body,
      createdBy: req.userId,
    });
    res.status(201).json({ success: true, data: internship, message: 'Internship record created' });
  } catch (error) {
    next(error);
  }
};

exports.getInternships = async (req, res, next) => {
  try {
    let query;
    if (req.userRole === 'student') {
      query = Internship.find({ student: req.userId });
    } else if (req.userRole === 'mentor') {
      query = Internship.find({ mentor: req.userId });
    } else {
      query = Internship.find();
    }

    const features = new APIFeatures(
      query.populate('student', 'name email').populate('mentor', 'name email'),
      req.query
    )
      .filter()
      .sort()
      .paginate();

    const internships = await features.query;
    const total = await Internship.countDocuments(features.query._conditions);
    const pagination = await features.getPaginationInfo(total);

    res.status(200).json({ success: true, count: internships.length, pagination, data: internships });
  } catch (error) {
    next(error);
  }
};

exports.getInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .populate('student', 'name email phone')
      .populate('mentor', 'name email');
    if (!internship) return next(new AppError('Internship not found', 404));
    if (req.userRole === 'student' && internship.student._id.toString() !== req.userId.toString()) {
      return next(new AppError('Not authorized', 403));
    }
    res.status(200).json({ success: true, data: internship });
  } catch (error) {
    next(error);
  }
};

exports.updateInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!internship) return next(new AppError('Internship not found', 404));
    res.status(200).json({ success: true, data: internship, message: 'Internship updated' });
  } catch (error) {
    next(error);
  }
};

exports.deleteInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findByIdAndDelete(req.params.id);
    if (!internship) return next(new AppError('Internship not found', 404));
    res.status(200).json({ success: true, message: 'Internship deleted' });
  } catch (error) {
    next(error);
  }
};

exports.completeInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      { status: 'completed', endDate: new Date(), ...req.body },
      { new: true }
    );
    if (!internship) return next(new AppError('Internship not found', 404));
    res.status(200).json({ success: true, data: internship, message: 'Internship completed' });
  } catch (error) {
    next(error);
  }
};
