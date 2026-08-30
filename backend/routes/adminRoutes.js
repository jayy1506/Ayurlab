import express from 'express';
import {
  getStudents,
  createStudent,
  disableStudent,
  enableStudent,
  deleteStudent,
  resetStudentPassword,
} from '../controllers/adminController.js';
import {
  authenticateUser,
  requireCollegeAccess,
  requireAdmin,
} from '../middleware/auth.js';

const router = express.Router();

// Apply auth + college restriction + admin role middleware to all admin routes
router.use(authenticateUser, requireCollegeAccess, requireAdmin);

router.get('/students', getStudents);
router.post('/students', createStudent);
router.patch('/students/:id/disable', disableStudent);
router.patch('/students/:id/enable', enableStudent);
router.delete('/students/:id', deleteStudent);
router.post('/students/:id/reset-password', resetStudentPassword);

export default router;
