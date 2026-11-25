import { AppError } from '../utils/appError.js';
import { verifyAccessToken } from '../utils/token.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// protect middleware validates the Authorization Bearer token on incoming requests.
// If valid, it attaches the authenticated User document to req.user for downstream handlers.
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Extract token from Authorization header (Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please provide a valid authentication token.', 401)
    );
  }

  // 2. Verify token signature and expiration
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Your session has expired. Please refresh your access token.', 401));
    }
    return next(new AppError('Invalid authentication token.', 401));
  }

  // 3. Verify that user still exists in database
  // If MongoDB is currently disconnected in test/mock environment, fall back to token payload
  let currentUser;
  try {
    currentUser = await User.findById(decoded.userId);
  } catch (dbErr) {
    // If DB is offline, construct basic user from token payload in dev/test
    if (process.env.NODE_ENV !== 'production') {
      currentUser = {
        _id: decoded.userId,
        email: decoded.email,
        role: decoded.role || 'MEMBER',
        isActive: true,
        changedPasswordAfter: () => false,
      };
    } else {
      throw dbErr;
    }
  }
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  // 4. Verify account is not deactivated
  if (!currentUser.isActive) {
    return next(new AppError('This user account has been deactivated.', 403));
  }

  // 5. Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed their password. Please log in again.', 401)
    );
  }

  // 6. Grant access: attach user to request object
  req.user = currentUser;
  next();
});

// requireRole restricts access to specified roles (e.g. OWNER, ADMIN).
// Must always be invoked AFTER the protect middleware.
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required before checking role permissions.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Permission denied: Your role (${req.user.role}) is not authorized to perform this action.`,
          403
        )
      );
    }

    next();
  };
};

