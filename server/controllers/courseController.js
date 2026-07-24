const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

exports.createCourse = async (req, res, next) => {
  try {
    const { modules: modulesData = [], ...rest } = req.body;
    const courseData = { ...rest, createdBy: req.userId, mentor: req.userId };
    if (req.file) courseData.thumbnail = req.file.path;
    const course = await Course.create(courseData);

    for (const modData of modulesData) {
      const { lessons: lessonsData = [], ...modRest } = modData;
      const mod = await Module.create({ ...modRest, course: course._id, createdBy: req.userId });
      await Course.findByIdAndUpdate(course._id, { $push: { modules: mod._id } });
      for (const lessonData of lessonsData) {
        const lesson = await Lesson.create({ ...lessonData, module: mod._id, course: course._id, createdBy: req.userId });
        await Module.findByIdAndUpdate(mod._id, { $push: { lessons: lesson._id } });
        await Course.findByIdAndUpdate(course._id, { $inc: { totalLessons: 1 } });
      }
    }

    const populated = await Course.findById(course._id).populate({ path: 'modules', populate: { path: 'lessons' } });
    res.status(201).json({ success: true, data: populated, message: 'Course created' });
  } catch (error) {
    next(error);
  }
};

exports.getCourses = async (req, res, next) => {
  try {
    let query;
    if (req.userRole === 'mentor') {
      query = Course.find({ mentor: req.userId }).populate('mentor', 'name email avatar');
    } else if (req.userRole === 'student') {
      const user = await User.findById(req.userId);
      const enrolledIds = user.enrolledCourses || [];
      query = Course.find({
        _id: { $in: enrolledIds },
        isPublished: true,
      }).populate('mentor', 'name email avatar');

      const features = new APIFeatures(query, req.query).filter().search(['title', 'description', 'category']).sort().limitFields().paginate();
      let courses = await features.query;
      const total = await Course.countDocuments(features.query._conditions);
      const pagination = await features.getPaginationInfo(total);

      const progressRecords = await Progress.find({ student: req.userId });
      const progressMap = {};
      progressRecords.forEach((p) => { progressMap[p.course.toString()] = p; });

      courses = courses.map((c) => {
        const obj = c.toObject();
        const prog = progressMap[c._id.toString()];
        obj.progress = prog ? { overallPercentage: prog.overallPercentage || 0, completedLessons: prog.completedLessons || [], totalLessons: prog.totalLessons || c.totalLessons } : null;
        obj.enrollmentStatus = true;
        return obj;
      });

      return res.status(200).json({ success: true, count: courses.length, pagination, data: courses });
    } else {
      query = Course.find().populate('mentor', 'name email avatar');
    }

    const features = new APIFeatures(query, req.query).filter().search(['title', 'description', 'category', 'tags']).sort().limitFields().paginate();
    const courses = await features.query;
    const total = await Course.countDocuments(features.query._conditions);
    const pagination = await features.getPaginationInfo(total);

    res.status(200).json({ success: true, count: courses.length, pagination, data: courses });
  } catch (error) {
    next(error);
  }
};

exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('mentor', 'name email avatar')
      .populate({
        path: 'modules',
        options: { sort: { order: 1 } },
        populate: { path: 'lessons', options: { sort: { order: 1 } } },
      });

    if (!course) return next(new AppError('Course not found', 404));

    if (req.userRole === 'student') {
      const progress = await Progress.findOne({ student: req.userId, course: course._id });
      const enrollmentStatus = course.enrolledStudents.some((id) => id.toString() === req.userId.toString());
      return res.status(200).json({
        success: true,
        data: { ...course.toObject(), progress, enrollmentStatus },
      });
    }

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

exports.selfEnroll = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return next(new AppError('Course not found', 404));
    if (!course.isPublished) return next(new AppError('Course is not available for enrollment', 400));

    if (course.enrolledStudents.some((id) => id.toString() === req.userId.toString())) {
      return next(new AppError('Already enrolled', 400));
    }

    course.enrolledStudents.push(req.userId);
    await course.save();
    await User.findByIdAndUpdate(req.userId, { $addToSet: { enrolledCourses: course._id } });
    await Progress.create({ student: req.userId, course: course._id, totalLessons: course.totalLessons || 0 });

    res.status(200).json({ success: true, message: 'Enrolled successfully', data: course });
  } catch (error) {
    next(error);
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.thumbnail = req.file.path;
    const course = await Course.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!course) return next(new AppError('Course not found', 404));
    res.status(200).json({ success: true, data: course, message: 'Course updated' });
  } catch (error) {
    next(error);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return next(new AppError('Course not found', 404));
    await Module.deleteMany({ course: course._id });
    await Lesson.deleteMany({ course: course._id });
    await Progress.deleteMany({ course: course._id });
    res.status(200).json({ success: true, message: 'Course deleted' });
  } catch (error) {
    next(error);
  }
};

exports.enrollStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return next(new AppError('Course not found', 404));

    if (course.enrolledStudents.some((id) => id.toString() === studentId)) {
      return next(new AppError('Student already enrolled', 400));
    }

    course.enrolledStudents.push(studentId);
    await course.save();
    await User.findByIdAndUpdate(studentId, { $addToSet: { enrolledCourses: course._id } });
    await Progress.create({ student: studentId, course: course._id, totalLessons: course.totalLessons });

    res.status(200).json({ success: true, message: 'Student enrolled', data: course });
  } catch (error) {
    next(error);
  }
};

exports.createModule = async (req, res, next) => {
  try {
    const mod = await Module.create({ ...req.body, course: req.params.courseId, createdBy: req.userId });
    await Course.findByIdAndUpdate(req.params.courseId, { $push: { modules: mod._id } });
    res.status(201).json({ success: true, data: mod, message: 'Module created' });
  } catch (error) {
    next(error);
  }
};

exports.updateModule = async (req, res, next) => {
  try {
    const mod = await Module.findByIdAndUpdate(req.params.moduleId, req.body, { new: true, runValidators: true });
    if (!mod) return next(new AppError('Module not found', 404));
    res.status(200).json({ success: true, data: mod, message: 'Module updated' });
  } catch (error) {
    next(error);
  }
};

exports.deleteModule = async (req, res, next) => {
  try {
    const mod = await Module.findByIdAndDelete(req.params.moduleId);
    if (!mod) return next(new AppError('Module not found', 404));
    await Lesson.deleteMany({ module: mod._id });
    await Course.findByIdAndUpdate(mod.course, { $pull: { modules: mod._id } });
    res.status(200).json({ success: true, message: 'Module deleted' });
  } catch (error) {
    next(error);
  }
};

exports.createLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.create({ ...req.body, module: req.params.moduleId, course: req.params.courseId, createdBy: req.userId });
    await Module.findByIdAndUpdate(req.params.moduleId, { $push: { lessons: lesson._id } });
    await Course.findByIdAndUpdate(req.params.courseId, { $inc: { totalLessons: 1 } });
    res.status(201).json({ success: true, data: lesson, message: 'Lesson created' });
  } catch (error) {
    next(error);
  }
};

exports.updateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.lessonId, req.body, { new: true, runValidators: true });
    if (!lesson) return next(new AppError('Lesson not found', 404));
    res.status(200).json({ success: true, data: lesson, message: 'Lesson updated' });
  } catch (error) {
    next(error);
  }
};

exports.deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.lessonId);
    if (!lesson) return next(new AppError('Lesson not found', 404));
    await Module.findByIdAndUpdate(lesson.module, { $pull: { lessons: lesson._id } });
    await Course.findByIdAndUpdate(lesson.course, { $inc: { totalLessons: -1 } });
    res.status(200).json({ success: true, message: 'Lesson deleted' });
  } catch (error) {
    next(error);
  }
};
