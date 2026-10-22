import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../middleware/auth.js';

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'ayurveda_secure_refresh_secret_key_2026_7d!z';

// Cookie helper
const getCookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: maxAgeMs,
});

// @desc   Login user & issue access and refresh cookies
// @route  POST /api/auth/login
// @access Public (login only)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Email and password are required',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Query user with password explicitly included
    const user = await User.findOne({ email: trimmedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        error: 'InvalidCredentials',
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'InvalidCredentials',
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        error: 'AccountDisabled',
        message: 'Your account has been disabled. Please contact your college administrator.',
      });
    }

    // College restriction check
    const allowedCollegeId = process.env.COLLEGE_ID || 'COLLEGE_001';
    if (user.collegeId !== allowedCollegeId) {
      return res.status(403).json({
        error: 'CollegeAccessDenied',
        message: `Access denied: User does not belong to the authorized college (${allowedCollegeId}).`,
      });
    }

    // Generate short-lived access token (15 mins) and refresh token (7 days)
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token on user for revocation tracking
    await User.updateOne({ _id: user._id }, { $set: { refreshToken } });

    // Set secure httpOnly cookies
    res.cookie('accessToken', accessToken, getCookieOptions(15 * 60 * 1000)); // 15 mins
    res.cookie('refreshToken', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000)); // 7 days
    res.cookie('token', accessToken, getCookieOptions(15 * 60 * 1000)); // Legacy compatibility

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      token: accessToken,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'An error occurred during authentication',
    });
  }
};

// @desc   Refresh access token using valid refresh token
// @route  POST /api/auth/refresh
// @access Public (with refreshToken cookie or body)
export const refreshSession = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Refresh token is required',
      });
    }

    // Verify refresh token signature
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({
        error: 'InvalidRefreshToken',
        message: 'Refresh token has expired or is invalid. Please log in again.',
      });
    }

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        error: 'InvalidRefreshToken',
        message: 'Malformed refresh token payload',
      });
    }

    // Find user with stored refresh token
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user) {
      return res.status(401).json({
        error: 'UserNotFound',
        message: 'User associated with refresh token no longer exists',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: 'AccountDisabled',
        message: 'Your account has been disabled. Please contact your college administrator.',
      });
    }

    // Token revocation check: token must match database record
    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({
        error: 'TokenRevoked',
        message: 'Refresh token has been invalidated or superseded. Please log in again.',
      });
    }

    // Issue new short-lived access token
    const newAccessToken = generateAccessToken(user);
    res.cookie('accessToken', newAccessToken, getCookieOptions(15 * 60 * 1000));
    res.cookie('token', newAccessToken, getCookieOptions(15 * 60 * 1000));

    return res.status(200).json({
      success: true,
      message: 'Access token refreshed successfully',
      accessToken: newAccessToken,
      token: newAccessToken,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('[RefreshSession Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to refresh authentication session',
    });
  }
};

// @desc   Get current authenticated user
// @route  GET /api/auth/me
// @access Private (authenticated user)
export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user.toJSON(),
    });
  } catch (error) {
    console.error('[GetMe Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to retrieve user profile',
    });
  }
};

// @desc   Change user password
// @route  POST /api/auth/change-password
// @access Private (authenticated user)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Current password, new password, and confirmation are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'WeakPassword',
        message: 'New password must be at least 6 characters long',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: 'PasswordMismatch',
        message: 'New password and confirmation password do not match',
      });
    }

    if (newPassword === currentPassword) {
      return res.status(400).json({
        error: 'SamePassword',
        message: 'New password must be different from current password',
      });
    }

    // Fetch user with password field
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        error: 'UserNotFound',
        message: 'User account not found',
      });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        error: 'InvalidCurrentPassword',
        message: 'Current password is incorrect',
      });
    }

    // Set new password (pre-save hook will hash it)
    user.password = newPassword;
    user.isDefaultPassword = false;

    // Issue fresh tokens upon password change
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('accessToken', accessToken, getCookieOptions(15 * 60 * 1000));
    res.cookie('refreshToken', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));
    res.cookie('token', accessToken, getCookieOptions(15 * 60 * 1000));

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      accessToken,
      token: accessToken,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('[ChangePassword Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'An error occurred while updating the password',
    });
  }
};

// @desc   Logout user & invalidate refresh token
// @route  POST /api/auth/logout
// @access Public / Private
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        if (decoded?.id) {
          await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
        }
      } catch (e) {
        // Token was invalid or expired anyway
      }
    } else if (req.user?._id) {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    }

    const clearOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    };

    res.clearCookie('accessToken', clearOptions);
    res.clearCookie('refreshToken', clearOptions);
    res.clearCookie('token', clearOptions);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('[Logout Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'An error occurred during logout',
    });
  }
};
