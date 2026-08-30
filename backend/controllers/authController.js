import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

// @desc   Login user & get token
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

    // Generate token
    const token = generateToken(user);

    // Optional HTTP-only cookie setting
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
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
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
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

// @desc   Logout user
// @route  POST /api/auth/logout
// @access Private / Public
export const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
