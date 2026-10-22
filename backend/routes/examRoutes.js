import express from 'express';
import multer from 'multer';
import path from 'path';
import { z } from 'zod';
import {
  getPresignedUrl,
  uploadRecording,
  submitExam,
  getExamAttempts,
  getExamAttemptById,
  getExamRecording,
  recordConsent,
  reviewExamAttempt,
} from '../controllers/examController.js';
import { authenticateUser, optionalAuthenticateUser, requireFacultyOrAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { LOCAL_UPLOADS_DIR } from '../utils/cloudStorage.js';

const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, LOCAL_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    const safeName = `exam_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    cb(null, safeName);
  },
});

// Allow video recordings up to 100MB
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['video/webm', 'video/mp4', 'video/ogg', 'application/octet-stream'];
    if (allowed.includes(file.mimetype) || file.originalname.endsWith('.webm') || file.originalname.endsWith('.mp4')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type: only video files (.webm, .mp4) are allowed'));
    }
  },
});

// Zod Validation Schemas
const recordConsentSchema = {
  body: z.object({
    consentGiven: z.boolean(),
    consentVersion: z.string().optional(),
    practicalName: z.string().optional(),
  }),
};

const submitExamSchema = {
  body: z.object({
    practicalId: z.string().optional(),
    practicalName: z.string().min(1, 'Practical name is required'),
    recordingUrl: z.string().optional(),
    consentGiven: z.boolean().optional(),
    consentTimestamp: z.string().or(z.date()).nullable().optional(),
    consentVersion: z.string().optional(),
    examModeType: z.enum(['video_proctored', 'faculty_supervised']).optional(),
    startedAt: z.string().or(z.date()).optional(),
    finishedAt: z.string().or(z.date()).optional(),
    score: z.number().min(0).max(100).optional(),
    flags: z
      .array(
        z.object({
          type: z.string(),
          timestamp: z.number().or(z.string()).or(z.date()),
          detail: z.string().optional(),
        })
      )
      .optional(),
    userName: z.string().optional(),
  }),
};

const reviewExamSchema = {
  body: z.object({
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
    reviewNotes: z.string().max(2000).optional(),
    score: z.number().min(0).max(100).optional(),
  }),
};

// 1. Consent, Storage & Upload Endpoints
router.post('/consent', optionalAuthenticateUser, validate(recordConsentSchema), recordConsent);
router.post('/presigned-url', optionalAuthenticateUser, getPresignedUrl);
router.post('/upload-recording', optionalAuthenticateUser, upload.single('recording'), uploadRecording);
router.post('/submit', optionalAuthenticateUser, validate(submitExamSchema), submitExam);

// 2. Faculty / Admin Review Endpoints
router.get('/attempts', authenticateUser, requireFacultyOrAdmin, getExamAttempts);
router.get('/attempts/:id', authenticateUser, requireFacultyOrAdmin, getExamAttemptById);
router.get('/attempts/:id/recording', authenticateUser, requireFacultyOrAdmin, getExamRecording);
router.patch('/attempts/:id/review', authenticateUser, requireFacultyOrAdmin, validate(reviewExamSchema), reviewExamAttempt);

export default router;
