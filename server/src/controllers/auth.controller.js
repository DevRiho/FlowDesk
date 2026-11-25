import { AuthService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { config } from '../config/index.js';

// Helper to set the refresh token as a secure httpOnly cookie.
// Storing refresh tokens in httpOnly cookies prevents XSS attacks
// from extracting the token, as JavaScript cannot read httpOnly cookies.
const setRefreshTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: config.env === 'production' ? 'Strict' : 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/api/auth', // Scoped strictly to auth endpoints
  };

  res.cookie('refreshToken', token, cookieOptions);
};

export const register = asyncHandler(async (req, res) => {
  const user = await AuthService.registerUser(req.body);

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please proceed to login.',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || '';

  const { user, accessToken, refreshToken } = await AuthService.loginUser({
    email,
    password,
    ipAddress,
    userAgent,
  });

  // Attach refresh token cookie to response
  setRefreshTokenCookie(res, refreshToken);

  res.status(200).json({
    success: true,
    message: 'Authentication successful',
    data: {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    },
  });
});

export const refresh = asyncHandler(async (req, res) => {
  // Read token from either httpOnly cookie or Authorization header fallback
  const incomingToken = req.cookies.refreshToken || req.body.refreshToken;

  const { accessToken, user } = await AuthService.refreshSession(incomingToken);

  res.status(200).json({
    success: true,
    message: 'Access token renewed successfully',
    data: {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies.refreshToken || req.body.refreshToken;

  await AuthService.logoutSession(incomingToken);

  // Clear cookie from client browser
  res.clearCookie('refreshToken', {
    httpOnly: true,
    path: '/api/auth',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export const getMe = asyncHandler(async (req, res) => {
  // req.user is set by the protect middleware
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await AuthService.requestPasswordReset(req.body.email);

  res.status(200).json({
    success: true,
    message: result.message,
    ...(result.resetToken && { resetToken: result.resetToken }),
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  await AuthService.resetPassword(token, password);

  res.status(200).json({
    success: true,
    message: 'Password reset successful. You can now log in with your new password.',
  });
});

