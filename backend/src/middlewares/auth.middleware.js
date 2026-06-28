const { verifyAccessToken } = require('../utils/jwt');
const { User } = require('../models');

/**
 * Middleware to protect routes. Ensures the user is authenticated.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Không có token xác thực' });
    }

    // 2. Verify token
    try {
      const decoded = verifyAccessToken(token);
      
      // 3. Find user
      const user = await User.findByPk(decoded.userId, { 
        attributes: ['id', '_id', 'email', 'role', 'status', 'fullName', 'phone', 'startDate', 'avatar', 'bankAccount', 'bankName'] 
      });
      
      if (!user) {
        return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại' });
      }

      // 4. Check status
      if (user.status === 'locked') {
        return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa' });
      }

      // 5. Attach user to request
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token đã hết hạn' });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to authorize specific roles.
 * @param  {...string} roles - Allowed roles (e.g., 'supermarket_owner', 'shift_manager')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện thao tác này' });
    }
    next();
  };
};

module.exports = { protect, authorize };
