const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const AppError = require('../utils/AppError');

exports.updateProgress = async (req, res, next) => {
  try {
    const { lessonId, completed } = req.body;
    const courseId = req.params.courseId;

    let progress = await Progress.findOne({ student: req.userId, course: courseId });
    if (!progress) {
      const course = await Course.findById(courseId);
      if (!course) return next(new AppError('Course not found', 404));

      progress = await Progress.create({
        student: req.userId,
        course: courseId,
        totalLessons: course.totalLessons,
      });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return next(new AppError('Lesson not found', 404));

    if (completed && !progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    } else if (!completed) {
      progress.completedLessons.pull(lessonId);
    }

    progress.totalLessons = progress.totalLessons || (await Lesson.countDocuments({ course: courseId }));
    progress.overallPercentage = progress.totalLessons > 0
      ? Math.round((progress.completedLessons.length / progress.totalLessons) * 100)
      : 0;

    if (progress.overallPercentage >= 100) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
    }

    progress.lastAccessed = new Date();
    await progress.save();

    res.status(200).json({ success: true, data: progress, message: 'Progress updated' });
  } catch (error) {
    next(error);
  }
};

exports.getProgress = async (req, res, next) => {
  try {
    const studentId = req.userRole === 'student' ? req.userId : (req.query.studentId || req.userId);
    const progress = await Progress.findOne({
      student: studentId,
      course: req.params.courseId,
    }).populate('completedLessons', 'title order');

    if (!progress) {
      return res.status(200).json({
        success: true,
        data: { overallPercentage: 0, completedLessons: [], totalLessons: 0, isCompleted: false },
      });
    }

    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};

exports.getCourseProgress = async (req, res, next) => {
  try {
    const progress = await Progress.find({ student: req.userId })
      .populate('course', 'title slug thumbnail')
      .sort('-lastAccessed');

    res.status(200).json({ success: true, count: progress.length, data: progress });
  } catch (error) {
    next(error);
  }
};
