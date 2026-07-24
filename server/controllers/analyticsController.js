const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const QuizResult = require('../models/QuizResult');
const Progress = require('../models/Progress');
const Certificate = require('../models/Certificate');
const Batch = require('../models/Batch');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalMentors,
      totalCourses,
      totalBatches,
      totalAssignments,
      totalCertificates,
      recentUsers,
      recentEnrollments,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: { $in: ['mentor', 'admin'] } }),
      Course.countDocuments(),
      Batch.countDocuments(),
      Assignment.countDocuments(),
      Certificate.countDocuments({ status: 'approved' }),
      User.find().sort('-createdAt').limit(5).select('name email role createdAt'),
      Course.aggregate([
        { $unwind: '$enrolledStudents' },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]),
    ]);

    const activeStudents = await User.countDocuments({ role: 'student', isActive: true, lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });

    const courseStats = await Course.aggregate([
      { $group: { _id: '$level', count: { $sum: 1 } } },
    ]);

    const recentActivities = await Promise.all([
      AssignmentSubmission.find().sort('-createdAt').limit(5).populate('student', 'name').populate({
        path: 'assignment',
        select: 'title',
      }),
      QuizResult.find().sort('-createdAt').limit(5).populate('student', 'name').populate('quiz', 'title'),
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalMentors,
          totalCourses,
          totalBatches,
          totalAssignments,
          totalCertificates,
          activeStudents,
          totalEnrollments: recentEnrollments[0]?.count || 0,
        },
        courseStats,
        recentUsers,
        recentActivities: {
          submissions: recentActivities[0],
          quizResults: recentActivities[1],
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getStudentAnalytics = async (req, res, next) => {
  try {
    const studentId = (req.params.studentId || req.userId).toString();
    const studentObjId = new mongoose.Types.ObjectId(studentId);

    const [progress, attendance, submissions, quizResults, certificates] = await Promise.all([
      Progress.find({ student: studentObjId }).populate('course', 'title'),
      Attendance.aggregate([
        { $match: { student: studentObjId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      AssignmentSubmission.aggregate([
        { $match: { student: studentObjId } },
        { $group: { _id: null, avgScore: { $avg: '$percentage' }, total: { $sum: 1 }, graded: { $sum: { $cond: [{ $eq: ['$status', 'graded'] }, 1, 0] } } } },
      ]),
      QuizResult.aggregate([
        { $match: { student: studentObjId } },
        { $group: { _id: null, avgScore: { $avg: '$percentage' }, total: { $sum: 1 }, passed: { $sum: { $cond: ['$isPassed', 1, 0] } } } },
      ]),
      Certificate.countDocuments({ student: studentObjId, status: 'approved' }),
    ]);

    const courseProgress = progress.map((p) => ({
      course: p.course?.title || 'Unknown',
      completed: p.completedLessons?.length || 0,
      total: p.totalLessons || 0,
      percentage: p.overallPercentage || 0,
      isCompleted: p.isCompleted,
    }));

    const attendanceMap = attendance.reduce((acc, a) => ({ ...acc, [a._id]: a.count }), {});
    attendanceMap.total = attendance.reduce((s, a) => s + a.count, 0);

    res.status(200).json({
      success: true,
      data: {
        courseProgress,
        attendance: attendanceMap,
        assignments: submissions[0] || { avgScore: 0, total: 0, graded: 0 },
        quizzes: quizResults[0] || { avgScore: 0, total: 0, passed: 0 },
        certificates,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getCourseAnalytics = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;

    const [course, enrollments, progress, completions] = await Promise.all([
      Course.findById(courseId).populate('mentor', 'name'),
      User.countDocuments({ enrolledCourses: courseId }),
      Progress.find({ course: courseId }),
      Progress.countDocuments({ course: courseId, isCompleted: true }),
    ]);

    const avgProgress = progress.length > 0 ? progress.reduce((s, p) => s + p.overallPercentage, 0) / progress.length : 0;

    const submissionStats = await AssignmentSubmission.aggregate([
      { $match: { course: new mongoose.Types.ObjectId(courseId) } },
      { $group: { _id: null, avgScore: { $avg: '$percentage' }, total: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        course,
        enrollments,
        avgProgress: Math.round(avgProgress),
        completionRate: enrollments > 0 ? Math.round((completions / enrollments) * 100) : 0,
        assignmentAvg: submissionStats[0]?.avgScore || 0,
        totalSubmissions: submissionStats[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMentorAnalytics = async (req, res, next) => {
  try {
    const mentorId = (req.params.mentorId || req.userId).toString();
    const mentorObjId = new mongoose.Types.ObjectId(mentorId);

    const [courses, students, assignments, avgScore] = await Promise.all([
      Course.countDocuments({ mentor: mentorObjId }),
      Course.aggregate([
        { $match: { mentor: mentorObjId } },
        { $unwind: '$enrolledStudents' },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]),
      Assignment.countDocuments({ mentor: mentorObjId }),
      AssignmentSubmission.aggregate([
        { $match: { gradedBy: mentorObjId } },
        { $group: { _id: null, avg: { $avg: '$percentage' } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCourses: courses,
        totalStudents: students[0]?.count || 0,
        totalAssignments: assignments,
        avgGrade: Math.round(avgScore[0]?.avg || 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getSystemAnalytics = async (req, res, next) => {
  try {
    const now = new Date();
    const thisMonth = { $gte: new Date(now.getFullYear(), now.getMonth(), 1), $lte: now };

    const [monthlyUsers, monthlyCourses, monthlySubmissions, monthlyAttendance] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: thisMonth } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      Course.countDocuments({ createdAt: thisMonth }),
      AssignmentSubmission.countDocuments({ createdAt: thisMonth }),
      Attendance.countDocuments({ date: thisMonth }),
    ]);

    const enrollmentTrend = await Course.aggregate([
      { $unwind: '$enrolledStudents' },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        monthly: {
          newUsers: monthlyUsers.reduce((s, u) => s + u.count, 0),
          byRole: monthlyUsers,
          newCourses: monthlyCourses,
          submissions: monthlySubmissions,
          attendance: monthlyAttendance,
        },
        enrollmentTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};
