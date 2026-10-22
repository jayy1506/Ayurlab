import express from 'express';
import { z } from 'zod';
import {
  login,
  getMe,
  changePassword,
  logout,
  refreshSession,
} from '../controllers/authController.js';
import { authenticateUser, requireCollegeAccess } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Validation Schemas
const loginSchema = {
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Valid email address is required').trim().toLowerCase(),
    password: z.string({ required_error: 'Password is required' }).min(1, 'Password cannot be empty'),
  }),
};

const changePasswordSchema = {
  body: z.object({
    currentPassword: z.string({ required_error: 'Current password is required' }).min(1, 'Current password cannot be empty'),
    newPassword: z.string({ required_error: 'New password is required' }).min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string({ required_error: 'Password confirmation is required' }).min(6, 'Confirmation password must be at least 6 characters'),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New password and confirmation password do not match',
    path: ['confirmPassword'],
  }),
};

const refreshSchema = {
  body: z.object({
    refreshToken: z.string().optional(),
  }).optional(),
};

// Public auth endpoints with strict rate limiting & Zod validation
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/refresh', authRateLimiter, validate(refreshSchema), refreshSession);
router.post('/logout', logout);

// Protected auth endpoints
router.get('/me', authenticateUser, requireCollegeAccess, getMe);
router.post('/change-password', authRateLimiter, authenticateUser, requireCollegeAccess, validate(changePasswordSchema), changePassword);

export default router;
