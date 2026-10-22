import express from 'express';
import { z } from 'zod';
import { handleAITutor, rateAIInteraction, getAIHistory } from '../controllers/aiController.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { optionalAuthenticateUser } from '../middleware/auth.js';

const router = express.Router();

const aiTutorSchema = {
  body: z.object({
    question: z
      .string({ required_error: 'Question is required' })
      .min(1, 'Question cannot be empty')
      .max(2000, 'Question exceeds maximum length of 2000 characters')
      .trim(),
    history: z
      .array(
        z.object({
          role: z.enum(['user', 'model', 'assistant']),
          text: z.string(),
        })
      )
      .optional(),
    experimentContext: z.string().max(500).optional(),
    userName: z.string().max(100).optional(),
  }),
};

const ratingSchema = {
  body: z.object({
    interactionId: z
      .string({ required_error: 'interactionId is required' })
      .min(1, 'interactionId cannot be empty'),
    rating: z
      .number({ required_error: 'rating is required' })
      .int('Rating must be an integer')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating cannot exceed 5'),
    feedback: z.string().max(1000).optional(),
  }),
};

const historySchema = {
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
};

// AI Question & Tutoring: optional auth, rate limited, and Zod validated
router.post('/tutor', optionalAuthenticateUser, aiRateLimiter, validate(aiTutorSchema), handleAITutor);

// Submit Star Rating & Feedback for an AI Interaction
router.post('/rating', optionalAuthenticateUser, validate(ratingSchema), rateAIInteraction);

// Get Paginated AI Interaction History
router.get('/history', optionalAuthenticateUser, validate(historySchema), getAIHistory);

export default router;
