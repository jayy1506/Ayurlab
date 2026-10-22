import express from 'express';
import { z } from 'zod';
import {
  getPracticals,
  getPracticalById,
  createPractical,
  updatePractical,
  deletePractical,
} from '../controllers/practicalController.js';
import {
  authenticateUser,
  requireFacultyOrAdmin,
} from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const practicalQuerySchema = {
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    category: z.string().optional(),
    search: z.string().optional(),
  }),
};

const idParamSchema = {
  params: z.object({
    id: z.string().min(1, 'Practical ID is required').trim(),
  }),
};

const practicalBodySchema = {
  body: z.object({
    name: z.string({ required_error: 'Practical name is required' }).min(2, 'Name must be at least 2 characters').trim(),
    category: z.string().optional(),
    description: z.string().optional(),
    shlok: z.string().optional(),
    apparatus: z.array(z.string()).optional(),
    ingredients: z.array(z.object({
      name: z.string(),
      qty: z.string().optional(),
      amount: z.number().optional(),
    })).optional(),
    steps: z.array(z.string()).optional(),
    precautions: z.array(z.string()).optional(),
    siddhiLakshana: z.record(z.any()).optional(),
    videoUrl: z.string().optional(),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
    duration: z.string().optional(),
  }),
};

// Public / Authenticated catalog reading with pagination & search
router.get('/', validate(practicalQuerySchema), getPracticals);
router.get('/:id', validate(idParamSchema), getPracticalById);

// Faculty & Admin practical management
router.post(
  '/',
  authenticateUser,
  requireFacultyOrAdmin,
  validate(practicalBodySchema),
  createPractical
);

router.put(
  '/:id',
  authenticateUser,
  requireFacultyOrAdmin,
  validate(idParamSchema),
  updatePractical
);

router.delete(
  '/:id',
  authenticateUser,
  requireFacultyOrAdmin,
  validate(idParamSchema),
  deletePractical
);

export default router;
