const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Batch = require('../models/Batch');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

exports.markAttendance = async (req, res, next) => {
  try {
    const { student, course, batch, date, status, notes } = req.body;

    const existing = await Attendance.findOne({ student, date: new Date(date).setHours(0, 0, 0, 0) });
    if (existing) {
      existing.status = status;
      existing.notes = notes || existing.notes;
      existing.markedBy = req.userId;
      await existing.save();
      return res.status(200).json({ success: true, data: existing, message: 'Attendance updated' });
    }

    const attendance = await Attendance.create({
      student,
      course,
      batch,
      date,
      status,
      notes,
      markedBy: req.userId,
    });

    res.status(201).json({ success: true, data: attendance, message: 'Attendance marked' });
  } catch (error) {
    next(error);
  }
};

exports.bulkMarkAttendance = async (req, res, next) => {
  try {
    const { batch, course, date, records } = req.body;
    const results = [];

    for (const record of records) {
      const existing = await Attendance.findOne({
        student: record.student,
        date: new Date(date).setHours(0, 0, 0, 0),
      });

      if (existing) {
        existing.status = record.status;
        existing.notes = record.notes || existing.notes;
        existing.markedBy = req.userId;
        await existing.save();
        results.push(existing);
      } else {
        const attendance = await Attendance.create({
          student: record.student,
          course,
          batch,
          date,
          status: record.status,
          notes: record.notes,
          markedBy: req.userId,
        });
        results.push(attendance);
      }
    }

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
      message: `Attendance marked for ${results.length} students`,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAttendance = async (req, res, next) => {
  try {
    const features = new APIFeatures(
      Attendance.find()
        .populate('student', 'name email avatar')
        .populate('markedBy', 'name')
        .populate('batch', 'name'),
      req.query
    )
      .filter()
      .sort()
      .paginate();

    const attendance = await features.query;
    const total = await Attendance.countDocuments(features.query._conditions);
    const pagination = await features.getPaginationInfo(total);

    res.status(200).json({ success: true, count: attendance.length, pagination, data: attendance });
  } catch (error) {
    next(error);
  }
};

exports.getStudentAttendance = async (req, res, next) => {
  try {
    const studentId = (req.params.studentId || req.userId).toString();
    const studentObjId = new mongoose.Types.ObjectId(studentId);
    const { startDate, endDate } = req.query;

    const filter = { student: studentObjId };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const records = await Attendance.find(filter).sort({ date: -1 });

    const total = records.length;
    const present = records.filter((r) => r.status === 'present').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const late = records.filter((r) => r.status === 'late').length;
    const excused = records.filter((r) => r.status === 'excused').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    const monthly = await Attendance.aggregate([
      { $match: { student: studentObjId } },
      {
        $group: {
          _id: { month: { $month: '$date' }, year: { $year: '$date' } },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: { records, summary: { total, present, absent, late, excused, percentage }, monthly },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAttendanceReport = async (req, res, next) => {
  try {
    const { batch, course, startDate, endDate } = req.query;
    const filter = {};
    if (batch) filter.batch = batch;
    if (course) filter.course = course;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const report = await Attendance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$student',
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
        },
      },
      {
        $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'student' },
      },
      { $unwind: '$student' },
      { $project: { 'student.password': 0, 'student.refreshToken': 0 } },
      { $sort: { present: -1 } },
    ]);

    res.status(200).json({ success: true, count: report.length, data: report });
  } catch (error) {
    next(error);
  }
};
