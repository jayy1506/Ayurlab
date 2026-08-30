import express from 'express';
import {
  login,
  getMe,
  changePassword,
  logout,
} from '../controllers/authController.js';
import { authenticateUser, requireCollegeAccess } from '../middleware/auth.js';

const router = express.Router();

// Public auth endpoints
router.post('/login', login);
router.post('/logout', logout);

// Protected auth endpoints
router.get('/me', authenticateUser, requireCollegeAccess, getMe);
router.post('/change-password', authenticateUser, requireCollegeAccess, changePassword);

export default router;
