import path from 'path';
import fs from 'fs';
import ExamAttempt from '../models/ExamAttempt.js';
import Practical from '../models/Practical.js';
import ActivityLog from '../models/ActivityLog.js';
import { generatePresignedUploadUrl, LOCAL_UPLOADS_DIR, isS3Configured, getS3Client } from '../utils/cloudStorage.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * Checks if a user is authorized to access an exam attempt's recording and details.
 * - Admins have full access across the institution.
 * - Faculty have access ONLY if they own the practical (createdBy matches).
 * - Students and unauthorized users receive false.
 */
export const isUserAuthorizedForExam = async (user, attempt) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role !== 'faculty') return false;

  let practical = null;
  if (attempt.practical) {
    practical = await Practical.findById(attempt.practical);
  } else if (attempt.practicalId) {
    practical = await Practical.findById(attempt.practicalId);
  } else if (attempt.practicalName) {
    practical = await Practical.findOne({ name: attempt.practicalName });
  }

  if (practical && practical.createdBy) {
    return practical.createdBy.toString() === user._id.toString();
  }

  // If no specific practical is associated or no owner, faculty does not own this course
  return false;
};

/**
 * Get S3 presigned URL or direct upload fallback URL
 * Route: POST /api/exam/presigned-url
 */
export const getPresignedUrl = async (req, res) => {
  try {
    const { fileName = 'exam_recording.webm', contentType = 'video/webm' } = req.body;
    const result = await generatePresignedUploadUrl(fileName, contentType);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[GetPresignedUrl Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to generate upload URL',
    });
  }
};

/**
 * Direct file upload handler (Local disk or S3 buffer upload)
 * Route: POST /api/exam/upload-recording
 */
export const uploadRecording = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'No video recording file provided in request',
      });
    }

    let recordingUrl = '';

    // If S3 is configured, upload to S3 from disk/buffer
    if (isS3Configured()) {
      try {
        const s3 = getS3Client();
        const bucket = process.env.AWS_S3_BUCKET;
        const region = process.env.AWS_REGION || 'ap-south-1';
        const key = `exam_recordings/${Date.now()}_${req.file.filename}`;
        const fileStream = fs.createReadStream(req.file.path);

        await s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: fileStream,
            ContentType: req.file.mimetype || 'video/webm',
          })
        );

        recordingUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

        // Remove local temporary file after S3 upload
        fs.unlink(req.file.path, () => {});
      } catch (s3Err) {
        console.warn('[UploadRecording Warning] S3 upload failed, retaining local file:', s3Err.message);
        recordingUrl = `/uploads/exam_recordings/${req.file.filename}`;
      }
    } else {
      // Local server-hosted storage URL
      recordingUrl = `/uploads/exam_recordings/${req.file.filename}`;
    }

    return res.status(200).json({
      success: true,
      message: 'Exam recording uploaded successfully',
      recordingUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });
  } catch (error) {
    console.error('[UploadRecording Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to upload exam recording',
    });
  }
};

/**
 * Record explicit student consent for exam proctoring
 * Route: POST /api/exam/consent
 */
export const recordConsent = async (req, res) => {
  try {
    const { consentGiven, consentVersion = '1.0', practicalName = 'Practical Exam' } = req.body;

    if (!consentGiven) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Explicit consent checkbox confirmation is required to proceed with video proctoring',
      });
    }

    const consentTimestamp = new Date();

    return res.status(200).json({
      success: true,
      message: 'Proctoring consent successfully recorded',
      consent: {
        consentGiven: true,
        consentTimestamp,
        consentVersion,
        user: req.user?._id || null,
        userName: req.user?.name || req.user?.email || 'Student Scholar',
        practicalName,
      },
    });
  } catch (error) {
    console.error('[RecordConsent Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to record proctoring consent',
    });
  }
};

/**
 * Submit Full Proctored Exam Attempt
 * Route: POST /api/exam/submit
 */
export const submitExam = async (req, res) => {
  try {
    const {
      practicalId = '',
      practicalName = 'Practical Exam',
      recordingUrl = '',
      startedAt,
      finishedAt,
      score = 0,
      flags = [],
      consentGiven = false,
      consentTimestamp = null,
      consentVersion = '1.0',
      examModeType = 'video_proctored',
    } = req.body;

    const user = req.user;
    const collegeId = user?.collegeId || process.env.COLLEGE_ID || 'COLLEGE_001';

    // If practicalId points to an existing Practical document, link it
    let practicalDocId = null;
    if (practicalId) {
      const pDoc = await Practical.findById(practicalId).catch(() => null);
      if (pDoc) practicalDocId = pDoc._id;
    }
    if (!practicalDocId && practicalName) {
      const pDoc = await Practical.findOne({ name: practicalName }).catch(() => null);
      if (pDoc) practicalDocId = pDoc._id;
    }

    const examAttempt = await ExamAttempt.create({
      user: user?._id || null,
      userName: user?.name || user?.email || req.body.userName || 'Student Scholar',
      practical: practicalDocId,
      practicalId,
      practicalName,
      recordingUrl: examModeType === 'faculty_supervised' ? '' : recordingUrl,
      consentGiven: Boolean(consentGiven),
      consentTimestamp: consentTimestamp ? new Date(consentTimestamp) : (consentGiven ? new Date() : null),
      consentVersion: String(consentVersion || '1.0'),
      examModeType: examModeType === 'faculty_supervised' ? 'faculty_supervised' : 'video_proctored',
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      finishedAt: finishedAt ? new Date(finishedAt) : new Date(),
      score: Number(score) || 0,
      flags: Array.isArray(flags) ? flags : [],
      flagCount: Array.isArray(flags) ? flags.length : 0,
      status: 'pending',
      collegeId,
    });

    if (user?._id) {
      const isSupervised = examModeType === 'faculty_supervised';
      await ActivityLog.create({
        user: user._id,
        userName: user.name || user.email,
        type: 'exam',
        title: `${isSupervised ? 'Faculty-Supervised' : 'Proctored'} Exam: ${practicalName}`,
        detail: `Score: ${score}% • ${flags.length} Proctoring Flag(s) • ${isSupervised ? 'Manual Proctoring Path' : 'Pending Review'}`,
        link: '/faculty',
        colorClass: isSupervised ? 'purple' : (flags.length > 0 ? 'amber' : 'green'),
        collegeId,
      }).catch(() => {});
    }

    return res.status(201).json({
      success: true,
      message: 'Exam submitted successfully with proctoring timeline',
      examAttempt,
    });
  } catch (error) {
    console.error('[SubmitExam Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to submit proctored exam',
    });
  }
};

/**
 * Get Paginated Exam Attempts for Faculty Review
 * Admins can view all attempts.
 * Faculty can view attempts for practicals they own (createdBy).
 * Route: GET /api/exam/attempts
 */
export const getExamAttempts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const collegeId = req.user?.collegeId || process.env.COLLEGE_ID || 'COLLEGE_001';
    const query = { collegeId };

    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [{ userName: searchRegex }, { practicalName: searchRegex }];
    }

    // Role-based course restriction: Faculty only see practicals they own
    if (req.user?.role === 'faculty') {
      const ownedPracticals = await Practical.find({ createdBy: req.user._id }).select('_id name');
      const ownedIds = ownedPracticals.map((p) => p._id);
      const ownedNames = ownedPracticals.map((p) => p.name);

      query.$and = [
        {
          $or: [
            { practical: { $in: ownedIds } },
            { practicalId: { $in: ownedIds.map(String) } },
            { practicalName: { $in: ownedNames } },
          ],
        },
      ];
    }

    const [total, attempts] = await Promise.all([
      ExamAttempt.countDocuments(query),
      ExamAttempt.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email studentId')
        .populate('reviewedBy', 'name email')
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      attempts,
    });
  } catch (error) {
    console.error('[GetExamAttempts Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to retrieve exam attempts',
    });
  }
};

/**
 * Get Single Exam Attempt by ID
 * Restricted strictly to faculty who own the course and admins.
 * Route: GET /api/exam/attempts/:id
 */
export const getExamAttemptById = async (req, res) => {
  try {
    const { id } = req.params;
    const attempt = await ExamAttempt.findById(id)
      .populate('user', 'name email studentId')
      .populate('reviewedBy', 'name email')
      .lean();

    if (!attempt) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Exam attempt not found',
      });
    }

    const authorized = await isUserAuthorizedForExam(req.user, attempt);
    if (!authorized) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied: Only faculty who own the course and administrators may access this exam attempt',
      });
    }

    return res.status(200).json({
      success: true,
      attempt,
    });
  } catch (error) {
    console.error('[GetExamAttemptById Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to retrieve exam details',
    });
  }
};

/**
 * Stream or retrieve playback URL for an exam recording
 * Restricted strictly to faculty who own the course and admins.
 * Route: GET /api/exam/attempts/:id/recording
 */
export const getExamRecording = async (req, res) => {
  try {
    const { id } = req.params;
    const attempt = await ExamAttempt.findById(id);

    if (!attempt) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Exam attempt not found',
      });
    }

    const authorized = await isUserAuthorizedForExam(req.user, attempt);
    if (!authorized) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied: Only faculty who own the course and administrators may access exam recordings',
      });
    }

    if (!attempt.recordingUrl) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Recording not found or has been purged according to retention policy',
      });
    }

    // Direct local file stream if exists on disk
    if (attempt.recordingUrl.startsWith('/uploads/')) {
      const filename = path.basename(attempt.recordingUrl);
      const filePath = path.resolve(LOCAL_UPLOADS_DIR, filename);

      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
    }

    return res.status(200).json({
      success: true,
      recordingUrl: attempt.recordingUrl,
      attemptId: attempt._id,
      consentGiven: attempt.consentGiven,
      consentTimestamp: attempt.consentTimestamp,
      consentVersion: attempt.consentVersion,
    });
  } catch (error) {
    console.error('[GetExamRecording Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to access exam recording',
    });
  }
};

/**
 * Review Exam Attempt (Assign Status, Final Grade & Notes)
 * Route: PATCH /api/exam/attempts/:id/review
 */
export const reviewExamAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes = '', score } = req.body;

    const attempt = await ExamAttempt.findById(id);
    if (!attempt) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Exam attempt not found',
      });
    }

    if (status && ['approved', 'rejected', 'pending'].includes(status)) {
      attempt.status = status;
    }
    if (reviewNotes !== undefined) {
      attempt.reviewNotes = reviewNotes.trim();
    }
    if (typeof score === 'number' && score >= 0 && score <= 100) {
      attempt.score = score;
    }

    attempt.reviewedBy = req.user?._id || null;
    attempt.reviewerName = req.user?.name || req.user?.email || 'Faculty Reviewer';

    await attempt.save();

    return res.status(200).json({
      success: true,
      message: `Exam attempt marked as ${attempt.status}`,
      attempt,
    });
  } catch (error) {
    console.error('[ReviewExamAttempt Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to review exam attempt',
    });
  }
};
