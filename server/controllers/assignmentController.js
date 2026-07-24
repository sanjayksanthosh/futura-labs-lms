const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Course = require('../models/Course');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

exports.createAssignment = async (req, res, next) => {
  try {
    const data = { ...req.body, createdBy: req.userId, mentor: req.body.mentor || req.userId };
    if (req.file) data.file = req.file.path;
    const assignment = await Assignment.create(data);
    res.status(201).json({ success: true, data: assignment, message: 'Assignment created' });
  } catch (error) {
    next(error);
  }
};

exports.getAssignments = async (req, res, next) => {
  try {
    let query;
    if (req.userRole === 'student') {
      const student = await require('../models/User').findById(req.userId).select('enrolledCourses');
      const enrolled = student?.enrolledCourses || [];
      const filter = enrolled.length > 0 ? { course: { $in: enrolled } } : {};
      query = Assignment.find(filter).populate('course', 'title');
      const assignments = await query;

      const submissions = await AssignmentSubmission.find({
        student: req.userId,
        assignment: { $in: assignments.map((a) => a._id) },
      });

      const subMap = {};
      submissions.forEach((s) => { subMap[s.assignment.toString()] = s; });

      const data = assignments.map((a) => {
        const obj = a.toObject();
        const sub = subMap[a._id.toString()];
        obj.submission = sub || null;
        obj.submitted = !!sub;
        obj.status = sub ? sub.status : 'pending';
        return obj;
      });

      return res.status(200).json({ success: true, count: data.length, data });
    }

    if (req.userRole === 'mentor') {
      query = Assignment.find({ createdBy: req.userId }).populate('course', 'title');
    } else {
      query = Assignment.find().populate('course', 'title');
    }

    const features = new APIFeatures(query, req.query).filter().search(['title', 'description']).sort().limitFields().paginate();
    const assignments = await features.query;
    const total = await Assignment.countDocuments(features.query._conditions);
    const pagination = await features.getPaginationInfo(total);
    res.status(200).json({ success: true, count: assignments.length, pagination, data: assignments });
  } catch (error) {
    next(error);
  }
};

exports.getAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('course', 'title');
    if (!assignment) return next(new AppError('Assignment not found', 404));

    if (req.userRole === 'student') {
      const submission = await AssignmentSubmission.findOne({ student: req.userId, assignment: assignment._id });
      return res.status(200).json({
        success: true,
        data: { ...assignment.toObject(), submission, submitted: !!submission, status: submission ? submission.status : 'pending' },
      });
    }

    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

exports.updateAssignment = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) data.file = req.file.path;
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!assignment) return next(new AppError('Assignment not found', 404));
    res.status(200).json({ success: true, data: assignment, message: 'Assignment updated' });
  } catch (error) {
    next(error);
  }
};

exports.deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) return next(new AppError('Assignment not found', 404));
    await AssignmentSubmission.deleteMany({ assignment: assignment._id });
    res.status(200).json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    next(error);
  }
};

exports.submitAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return next(new AppError('Assignment not found', 404));

    const existing = await AssignmentSubmission.findOne({ student: req.userId, assignment: req.params.id });
    if (existing) return next(new AppError('Already submitted', 400));

    const data = { student: req.userId, assignment: req.params.id, course: assignment.course, submittedAt: new Date() };
    if (req.file) data.files = [{ title: req.file.originalname, url: req.file.path, type: req.file.mimetype, size: req.file.size }];
    if (req.body.textSubmission) data.textSubmission = req.body.textSubmission;

    const submission = await AssignmentSubmission.create(data);
    res.status(201).json({ success: true, data: submission, message: 'Submitted' });
  } catch (error) {
    next(error);
  }
};

exports.getSubmissions = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const submissions = await AssignmentSubmission.find({ assignment: assignmentId })
      .populate('student', 'name email avatar')
      .sort('-submittedAt');
    res.status(200).json({ success: true, count: submissions.length, data: submissions });
  } catch (error) {
    next(error);
  }
};

exports.gradeSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback } = req.body;

    const existing = await AssignmentSubmission.findById(submissionId).populate('assignment', 'totalPoints');
    if (!existing) return next(new AppError('Submission not found', 404));

    const maxScore = existing.assignment?.totalPoints || 100;
    const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const letterGrade = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';

    const submission = await AssignmentSubmission.findByIdAndUpdate(
      submissionId,
      { score, maxScore, percentage: pct, grade: letterGrade, feedback, gradedBy: req.userId, status: 'graded', gradedAt: new Date() },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: submission, message: 'Graded' });
  } catch (error) {
    next(error);
  }
};
