const AuthService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Xử lý yêu cầu đăng nhập
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await AuthService.login(email, password);

    // Gắn refresh token vào httpOnly cookie an toàn
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    return successResponse(res, { accessToken, user }, 'Đăng nhập thành công');
  } catch (err) {
    next(err);
  }
};

/**
 * Xử lý làm mới Access Token
 */
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    const { accessToken } = await AuthService.refreshAccessToken(token);
    
    return successResponse(res, { accessToken }, 'Refresh token thành công');
  } catch (err) {
    next(err);
  }
};

/**
 * Xử lý đăng xuất
 */
const logout = async (req, res, next) => {
  try {
    await AuthService.logout(req.user._id);
    res.clearCookie('refreshToken');
    return successResponse(res, null, 'Đăng xuất thành công');
  } catch (err) {
    next(err);
  }
};

/**
 * Trả về thông tin người dùng hiện tại
 */
const me = async (req, res, next) => {
  try {
    return successResponse(res, req.user, 'Lấy thông tin người dùng thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { login, refreshToken, logout, me };
