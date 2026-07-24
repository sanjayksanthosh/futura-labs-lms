const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

exports.generateCertificate = async (req, res, next) => {
  try {
    const { studentId, courseId, grade, percentage } = req.body;

    const existing = await Certificate.findOne({ student: studentId, course: courseId });
    if (existing) return next(new AppError('Certificate already generated', 400));

    const course = await Course.findById(courseId);
    if (!course) return next(new AppError('Course not found', 404));

    const certificate = await Certificate.create({
      student: studentId,
      course: courseId,
      title: `Certificate of Completion - ${course.title}`,
      description: `This certifies that the student has successfully completed ${course.title}`,
      grade,
      percentage,
      issuedBy: req.userId,
      status: 'pending',
    });

    res.status(201).json({ success: true, data: certificate, message: 'Certificate generated' });
  } catch (error) {
    next(error);
  }
};

exports.getCertificates = async (req, res, next) => {
  try {
    let query;
    if (req.userRole === 'student') {
      query = Certificate.find({ student: req.userId });
    } else {
      query = Certificate.find();
    }

    const features = new APIFeatures(
      query
        .populate('student', 'name email')
        .populate('course', 'title')
        .populate('approvedBy', 'name'),
      req.query
    )
      .filter()
      .sort()
      .paginate();

    const certificates = await features.query;
    const total = await Certificate.countDocuments(features.query._conditions);
    const pagination = await features.getPaginationInfo(total);

    res.status(200).json({ success: true, count: certificates.length, pagination, data: certificates });
  } catch (error) {
    next(error);
  }
};

exports.approveCertificate = async (req, res, next) => {
  try {
    const updateData = { status: 'approved', approvedBy: req.userId };
    if (req.body.certificateUrl) updateData.certificateUrl = req.body.certificateUrl;
    const certificate = await Certificate.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!certificate) return next(new AppError('Certificate not found', 404));

    await Notification.create({
      recipient: certificate.student,
      type: 'certificate',
      title: 'Certificate Approved',
      message: `Your certificate for ${certificate.title} has been approved`,
      link: `/student/certificates`,
    });

    res.status(200).json({ success: true, data: certificate, message: 'Certificate approved' });
  } catch (error) {
    next(error);
  }
};

exports.rejectCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', revokeReason: req.body.reason },
      { new: true }
    );
    if (!certificate) return next(new AppError('Certificate not found', 404));
    res.status(200).json({ success: true, data: certificate, message: 'Certificate rejected' });
  } catch (error) {
    next(error);
  }
};

exports.revokeCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      { isRevoked: true, revokedAt: new Date(), revokeReason: req.body.reason },
      { new: true }
    );
    if (!certificate) return next(new AppError('Certificate not found', 404));
    res.status(200).json({ success: true, data: certificate, message: 'Certificate revoked' });
  } catch (error) {
    next(error);
  }
};
