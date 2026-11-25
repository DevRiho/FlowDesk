import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import { AppError } from '../utils/appError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/token.js';
import crypto from 'crypto';

// The AuthService encapsulates all business logic related to identity,
// token life cycles, session tracking, and credential verification.
export class AuthService {
  // Registers a new user account
  static async registerUser({ name, email, password, companyName, role = 'OWNER' }) {
    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    // 2. Create the user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    // 3. Automatically create initial default workspace for the registered user
    const workspaceName = companyName?.trim() || `${name.split(' ')[0]}'s Workspace`;
    const slug = `${workspaceName.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;
    
    // Import dynamically or use mongoose to avoid circular dependency
    const Workspace = (await import('../models/Workspace.js')).default;
    const TeamMember = (await import('../models/TeamMember.js')).default;

    const workspace = await Workspace.create({
      name: workspaceName,
      slug,
      owner: user._id,
    });

    await TeamMember.create({
      user: user._id,
      workspace: workspace._id,
      role: 'OWNER',
      title: 'Founder / Owner',
    });

    return user;
  }

  // Authenticates credentials and returns access token + persists refresh token session
  static async loginUser({ email, password, ipAddress = '', userAgent = '' }) {
    // 1. Fetch user including password hash (which is select: false by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    // 2. Check if account is active
    if (!user.isActive) {
      throw new AppError('This account has been deactivated. Please contact support.', 403);
    }

    // 3. Verify password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new AppError('Invalid email or password.', 401);
    }

    // 4. Generate token pair
    const accessToken = generateAccessToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    const refreshTokenString = generateRefreshToken({
      userId: user._id,
    });

    // 5. Calculate expiry date for refresh token (7 days)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // 6. Save refresh token session in database
    await RefreshToken.create({
      user: user._id,
      token: refreshTokenString,
      ipAddress,
      userAgent,
      expiresAt,
    });

    // Strip password from returned user object
    user.password = undefined;

    return {
      user,
      accessToken,
      refreshToken: refreshTokenString,
    };
  }

  // Refreshes short-lived access token using long-lived refresh token
  static async refreshSession(tokenString) {
    if (!tokenString) {
      throw new AppError('Refresh token is required.', 401);
    }

    // 1. Verify token signature
    let decoded;
    try {
      decoded = verifyRefreshToken(tokenString);
    } catch (err) {
      throw new AppError('Invalid or expired refresh token. Please log in again.', 401);
    }

    // 2. Locate active session in database
    const session = await RefreshToken.findOne({
      token: tokenString,
      isValid: true,
    });

    if (!session) {
      // Possible token reuse or revoked session: revoke any token for safety
      throw new AppError('Refresh session has been revoked or expired.', 401);
    }

    // 3. Fetch user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new AppError('User belonging to this session no longer exists.', 401);
    }

    // 4. Issue new access token
    const newAccessToken = generateAccessToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken: newAccessToken,
      user,
    };
  }

  // Logs out session by invalidating the refresh token in the database
  static async logoutSession(tokenString) {
    if (tokenString) {
      await RefreshToken.deleteOne({ token: tokenString });
    }
    return true;
  }

  // Initiates password reset flow
  static async requestPasswordReset(email) {
    const user = await User.findOne({ email });
    if (!user) {
      // Security best practice: Never disclose whether an email exists or not
      return { message: 'If an account exists with that email, a reset link has been dispatched.' };
    }

    // Generate unhashed reset token and save hash on user model
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // In a full production setup with SMTP, an email is dispatched here.
    // For local development, we return the token if in dev mode to facilitate testing.
    return {
      message: 'Password reset link dispatched.',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
    };
  }

  // Resets password using token
  static async resetPassword(resetToken, newPassword) {
    // 1. Hash the incoming plain token to compare against database hash
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // 2. Find user with valid and unexpired token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError('Password reset token is invalid or has expired.', 400);
    }

    // 3. Update password & clear reset tokens
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 4. Invalidate all existing sessions on password change for security
    await RefreshToken.deleteMany({ user: user._id });

    return true;
  }
}

