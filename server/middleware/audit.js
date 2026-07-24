const AuditLog = require('../models/AuditLog');

const auditLog = (action, resource) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = async function (body) {
      if (res.statusCode < 400) {
        try {
          await AuditLog.create({
            user: req.userId,
            action,
            resource,
            resourceId: req.params.id || body?.data?._id || body?._id,
            details: { method: req.method, url: req.originalUrl, body: sanitizeBody(req.body) },
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            status: 'success',
          });
        } catch (err) {
          // silently fail audit logging
        }
      }
      return originalJson(body);
    };
    next();
  };
};

function sanitizeBody(body) {
  if (!body) return {};
  const sanitized = { ...body };
  delete sanitized.password;
  delete sanitized.confirmPassword;
  delete sanitized.token;
  return sanitized;
}

module.exports = { auditLog };
