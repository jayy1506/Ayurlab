import express from 'express';
import { z } from 'zod';
import {
  saveSimulationAttempt,
  getMySimulationAttempts,
  getStudentActivity,
  saveExamAttempt,
  getExamAttempts,
  updateExamAttemptStatus,
  getFacultySimulationAttempts,
  gradeSimulationAttempt,
} from '../controllers/simulationController.js';
import {
  authenticateUser,
  requireFacultyOrAdmin,
} from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const attemptBodySchema = {
  body: z.object({
    practicalId: z.string().optional(),
    practicalName: z.string({ required_error: 'Practical name is required' }),
    score: z.number().min(0).max(100),
    passed: z.boolean().optional(),
    durationSeconds: z.number().optional(),
    mistakes: z.array(z.any()).optional(),
    stepLog: z.array(z.any()).optional(),
    feedback: z.string().optional(),
  }),
};

const examBodySchema = {
  body: z.object({
    practicalId: z.string().optional(),
    practicalName: z.string({ required_error: 'Practical name is required' }),
    recordingUrl: z.string().optional(),
    score: z.number().optional(),
    flags: z.array(z.any()).optional(),
  }),
};

const paginationQuerySchema = {
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    status: z.string().optional(),
    type: z.string().optional(),
    studentId: z.string().optional(),
  }),
};

// Simulation attempt endpoints
router.post('/attempts', authenticateUser, validate(attemptBodySchema), saveSimulationAttempt);
router.get('/attempts/me', authenticateUser, validate(paginationQuerySchema), getMySimulationAttempts);
router.get('/admin/attempts', authenticateUser, requireFacultyOrAdmin, validate(paginationQuerySchema), getFacultySimulationAttempts);
router.patch('/admin/attempts/:id', authenticateUser, requireFacultyOrAdmin, gradeSimulationAttempt);

// Exam attempt endpoints
router.post('/exam/attempts', authenticateUser, validate(examBodySchema), saveExamAttempt);
router.get('/admin/exam-attempts', authenticateUser, requireFacultyOrAdmin, validate(paginationQuerySchema), getExamAttempts);
router.patch('/admin/exam-attempts/:id', authenticateUser, requireFacultyOrAdmin, updateExamAttemptStatus);

// Activity logs endpoint
router.get('/admin/student-activity', authenticateUser, requireFacultyOrAdmin, validate(paginationQuerySchema), getStudentActivity);

export default router;
