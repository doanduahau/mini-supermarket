const { User } = require('../models');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

/**
 * Đăng nhập người dùng, trả về tokens và thông tin cơ bản
 */
const login = async (email, password) => {
  // 1. Tìm user theo email (yêu cầu field select = false ở schema)
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw Object.assign(new Error('Email hoặc mật khẩu không đúng'), { statusCode: 401 });
  }

  // 2. Check trạng thái khóa
  if (user.status === 'locked') {
    throw Object.assign(new Error('Tài khoản đã bị khóa, liên hệ quản lý'), { statusCode: 403 });
  }

  // 3. So sánh mật khẩu
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw Object.assign(new Error('Email hoặc mật khẩu không đúng'), { statusCode: 401 });
  }

  // 4. Tạo token
  const accessToken = generateAccessToken({ userId: user._id, role: user.role, email: user.email });
  const refreshToken = generateRefreshToken({ userId: user._id });

  // 5. Lưu refresh token vào database
  user.refreshToken = refreshToken;
  await user.save();

  // 6. Trả về kết quả
  return {
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
    },
  };
};

/**
 * Cấp lại Access Token mới bằng Refresh Token
 */
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw Object.assign(new Error('Không có refresh token'), { statusCode: 401 });
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw Object.assign(new Error('Refresh token không hợp lệ hoặc đã hết hạn'), { statusCode: 401 });
  }

  // Tìm user theo id từ token VÀ refresh token phải khớp trong db
  const user = await User.findOne({ _id: decoded.userId, refreshToken });
  if (!user) {
    throw Object.assign(new Error('Refresh token không hợp lệ'), { statusCode: 401 });
  }

  // Ký token mới
  const accessToken = generateAccessToken({ userId: user._id, role: user.role, email: user.email });
  
  return { accessToken };
};

/**
 * Đăng xuất: xóa Refresh Token trong database
 */
const logout = async (userId) => {
  const user = await User.findById(userId);
  if (user) {
    user.refreshToken = null;
    await user.save();
  }
  return true;
};

module.exports = { login, refreshAccessToken, logout };
