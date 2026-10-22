import express from 'express';
import { z } from 'zod';
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
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Validation Schemas
const idParamSchema = {
  params: z.object({
    id: z.string({ required_error: 'User ID parameter is required' }).min(1, 'User ID cannot be empty').trim(),
  }),
};

const createStudentSchema = {
  body: z.object({
    name: z.string({ required_error: 'Student name is required' }).min(2, 'Name must be at least 2 characters').trim(),
    email: z.string({ required_error: 'Student email is required' }).email('Valid student email is required').trim().toLowerCase(),
    studentId: z.string().optional().default(''),
    password: z.string().min(6, 'Initial password must be at least 6 characters').optional(),
  }),
};

const createFacultySchema = {
  body: z.object({
    name: z.string({ required_error: 'Faculty name is required' }).min(2, 'Name must be at least 2 characters').trim(),
    email: z.string({ required_error: 'Faculty email is required' }).email('Valid faculty email is required').trim().toLowerCase(),
    facultyId: z.string().optional().default(''),
    department: z.string().optional().default('Dravyaguna'),
    password: z.string().min(6, 'Initial password must be at least 6 characters').optional(),
  }),
};

const listQuerySchema = {
  query: z.object({
    search: z.string().optional(),
    status: z.enum(['all', 'active', 'disabled']).optional(),
    page: z.string().regex(/^\d+$/, 'Page must be a positive integer').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a positive integer').optional(),
  }),
};

// Apply auth + college restriction + admin role middleware to all admin routes
router.use(authenticateUser, requireCollegeAccess, requireAdmin);

// Student routes with Zod validation
router.get('/students', validate(listQuerySchema), getStudents);
router.post('/students', validate(createStudentSchema), createStudent);
router.patch('/students/:id/disable', validate(idParamSchema), disableStudent);
router.patch('/students/:id/enable', validate(idParamSchema), enableStudent);
router.delete('/students/:id', validate(idParamSchema), deleteStudent);
router.post('/students/:id/reset-password', validate(idParamSchema), resetStudentPassword);

// Faculty routes with Zod validation
router.get('/faculty', validate(listQuerySchema), getFaculty);
router.post('/faculty', validate(createFacultySchema), createFaculty);
router.patch('/faculty/:id/disable', validate(idParamSchema), disableFaculty);
router.patch('/faculty/:id/enable', validate(idParamSchema), enableFaculty);
router.delete('/faculty/:id', validate(idParamSchema), deleteFaculty);
router.post('/faculty/:id/reset-password', validate(idParamSchema), resetFacultyPassword);

export default router;
