const User = require('../models/User');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

exports.getUsers = async (req, res, next) => {
  try {
    const features = new APIFeatures(
      User.find().populate('institute', 'name').populate('batch', 'name'),
      req.query
    )
      .filter()
      .search(['name', 'email', 'phone'])
      .sort()
      .limitFields()
      .paginate();

    const users = await features.query;
    const total = await User.countDocuments(features.query._conditions);
    const pagination = await features.getPaginationInfo(total);

    res.status(200).json({ success: true, count: users.length, pagination, data: users });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('institute', 'name logo')
      .populate('batch', 'name code')
      .populate('enrolledCourses', 'title slug')
      .populate('assignedCourses', 'title slug');

    if (!user) return next(new AppError('User not found', 404));
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, institute, batch } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return next(new AppError('Email already exists', 400));

    const user = await User.create({ name, email, password, phone, role, institute, batch });

    res.status(201).json({ success: true, data: user, message: 'User created successfully' });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, phone, role, isActive, institute, batch, permissions, bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { name, email, phone, role, isActive, institute, batch, permissions, bio } },
      { new: true, runValidators: true }
    );
    if (!user) return next(new AppError('User not found', 404));
    res.status(200).json({ success: true, data: user, message: 'User updated' });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return next(new AppError('Both current and new password are required', 400));
    if (newPassword.length < 6) return next(new AppError('New password must be at least 6 characters', 400));

    const user = await User.findById(req.params.id).select('+password');
    if (!user) return next(new AppError('User not found', 404));

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return next(new AppError('Current password is incorrect', 401));

    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(new AppError('User not found', 404));
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

exports.bulkCreateUsers = async (req, res, next) => {
  try {
    const { users } = req.body;
    const created = [];
    const errors = [];

    for (const userData of users) {
      try {
        const existing = await User.findOne({ email: userData.email });
        if (existing) {
          errors.push({ email: userData.email, message: 'Already exists' });
          continue;
        }
        const user = await User.create(userData);
        created.push(user);
      } catch (err) {
        errors.push({ email: userData.email, message: err.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `Created ${created.length} users`,
      data: { created: created.length, errors },
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserStats = async (req, res, next) => {
  try {
    const total = await User.countDocuments();
    const active = await User.countDocuments({ isActive: true });
    const byRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
    const recent = await User.find().sort('-createdAt').limit(10).select('name email role createdAt');

    res.status(200).json({
      success: true,
      data: { total, active, byRole, recent },
    });
  } catch (error) {
    next(error);
  }
};
