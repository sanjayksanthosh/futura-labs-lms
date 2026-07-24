const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const paginate = (page = 1, limit = 10) => {
  const p = Math.max(1, parseInt(page));
  const l = Math.min(100, Math.max(1, parseInt(limit)));
  return { skip: (p - 1) * l, limit: l, page: p };
};

const buildFilter = (query, allowedFields) => {
  const filter = {};
  for (const [key, value] of Object.entries(query)) {
    if (allowedFields.includes(key) && value !== undefined && value !== null && value !== '') {
      if (typeof value === 'string' && ['name', 'title', 'email', 'description'].includes(key)) {
        filter[key] = { $regex: value, $options: 'i' };
      } else {
        filter[key] = value;
      }
    }
  }
  return filter;
};

const getProgressPercentage = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

module.exports = {
  hashPassword,
  comparePassword,
  generateOTP,
  generateSlug,
  paginate,
  buildFilter,
  getProgressPercentage,
};
