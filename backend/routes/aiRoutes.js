import express from 'express';
import { handleAITutor } from '../controllers/aiController.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply AI rate limiter (5 requests / 10 seconds sliding window)
router.post('/tutor', aiRateLimiter, handleAITutor);

export default router;
