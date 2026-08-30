import express from 'express';
import {
  getStudents,
  createStudent,
  disableStudent,
  enableStudent,
  deleteStudent,
  resetStudentPassword,
  getFaculty,
  createFaculty,
  disableFaculty,
  enableFaculty,
  deleteFaculty,
  resetFacultyPassword,
} from '../controllers/adminController.js';
import {
  authenticateUser,
  requireCollegeAccess,
  requireAdmin,
} from '../middleware/auth.js';

const router = express.Router();

// Apply auth + college restriction + admin role middleware to all admin routes
router.use(authenticateUser, requireCollegeAccess, requireAdmin);

// Student routes
router.get('/students', getStudents);
router.post('/students', createStudent);
router.patch('/students/:id/disable', disableStudent);
router.patch('/students/:id/enable', enableStudent);
router.delete('/students/:id', deleteStudent);
router.post('/students/:id/reset-password', resetStudentPassword);

// Faculty routes
router.get('/faculty', getFaculty);
router.post('/faculty', createFaculty);
router.patch('/faculty/:id/disable', disableFaculty);
router.patch('/faculty/:id/enable', enableFaculty);
router.delete('/faculty/:id', deleteFaculty);
router.post('/faculty/:id/reset-password', resetFacultyPassword);

export default router;
