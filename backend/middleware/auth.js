import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ayurveda_secure_jwt_secret_key_2026_x89!k';

// Helper to generate signed JWT token
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      collegeId: user.collegeId,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Authenticate user middleware: verifies token and validates active status
export const authenticateUser = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token is required to access this resource',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        error: 'InvalidToken',
        message: 'Token is invalid or has expired',
      });
    }

    // Fetch user from database
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        error: 'UserNotFound',
        message: 'Authenticated user account no longer exists',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        error: 'AccountDisabled',
        message: 'Your account has been disabled. Please contact your college administrator.',
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('[AuthMiddleware Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'An error occurred while verifying user authorization',
    });
  }
};

// College-level restriction middleware
export const requireCollegeAccess = (req, res, next) => {
  const allowedCollegeId = process.env.COLLEGE_ID || 'COLLEGE_001';

  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication is required',
    });
  }

  if (req.user.collegeId !== allowedCollegeId) {
    return res.status(403).json({
      error: 'CollegeAccessDenied',
      message: `Access denied: User does not belong to authorized college (${allowedCollegeId})`,
    });
  }

  next();
};

// Admin role verification middleware
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Administrator privileges are required for this action',
    });
  }
  next();
};

// Faculty role verification middleware
export const requireFaculty = (req, res, next) => {
  if (!req.user || req.user.role !== 'faculty') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Faculty privileges are required for this action',
    });
  }
  next();
};

// Faculty or Admin role verification middleware
export const requireFacultyOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'faculty' && req.user.role !== 'admin')) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Faculty or Administrator privileges are required for this action',
    });
  }
  next();
};

// Student role verification middleware
export const requireStudent = (req, res, next) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Student privileges are required for this action',
    });
  }
  next();
};

