import SimulationAttempt from '../models/SimulationAttempt.js';
import ExamAttempt from '../models/ExamAttempt.js';
import ActivityLog from '../models/ActivityLog.js';
import Practical from '../models/Practical.js';

// @desc   Save student simulation experiment attempt
// @route  POST /api/simulation/attempts
// @access Private (Student / Faculty / Admin)
export const saveSimulationAttempt = async (req, res) => {
  try {
    const {
      practicalId,
      practicalName,
      startedAt,
      finishedAt,
      durationSeconds,
      score,
      passed,
      mistakes,
      stepLog,
      feedback,
    } = req.body;

    const user = req.user;
    const collegeId = user.collegeId || process.env.COLLEGE_ID || 'COLLEGE_001';

    // Link practical ObjectId if exists
    let practicalDoc = null;
    if (practicalId) {
      if (practicalId.match(/^[0-9a-fA-F]{24}$/)) {
        practicalDoc = await Practical.findById(practicalId);
      } else {
        practicalDoc = await Practical.findOne({
          name: { $regex: new RegExp(`^${practicalName || practicalId}$`, 'i') },
        });
      }
    }

    const attempt = await SimulationAttempt.create({
      user: user._id,
      userName: user.name || user.email,
      practical: practicalDoc ? practicalDoc._id : null,
      practicalId: practicalId || '',
      practicalName: practicalName || practicalDoc?.name || 'Practical Experiment',
      startedAt: startedAt ? new Date(startedAt) : new Date(Date.now() - (durationSeconds || 60) * 1000),
      finishedAt: finishedAt ? new Date(finishedAt) : new Date(),
      durationSeconds: durationSeconds || 60,
      score: typeof score === 'number' ? score : 0,
      passed: Boolean(passed),
      mistakes: Array.isArray(mistakes) ? mistakes : [],
      stepLog: Array.isArray(stepLog) ? stepLog : [],
      feedback: feedback || '',
      collegeId,
    });

    // Also persist into ActivityLog collection
    await ActivityLog.create({
      user: user._id,
      userName: user.name || user.email,
      type: 'practical',
      title: `Completed ${attempt.practicalName}`,
      detail: `Score: ${attempt.score}% • ${attempt.passed ? 'Passed' : 'Needs Practice'}`,
      link: '/practical',
      colorClass: attempt.passed ? 'green' : 'amber',
      collegeId,
    }).catch((e) => console.warn('[ActivityLog sync warning]:', e.message));

    return res.status(201).json({
      success: true,
      message: 'Simulation attempt recorded successfully',
      attempt,
    });
  } catch (error) {
    console.error('[SaveSimulationAttempt Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to record simulation attempt',
    });
  }
};

// @desc   Get current student's simulation attempt history
// @route  GET /api/simulation/attempts/me
// @access Private (Authenticated)
export const getMySimulationAttempts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 15));
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };

    const [total, attempts] = await Promise.all([
      SimulationAttempt.countDocuments(query),
      SimulationAttempt.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      attempts,
    });
  } catch (error) {
    console.error('[GetMySimulationAttempts Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to retrieve simulation history',
    });
  }
};

// @desc   Get student activity history for faculty / admin
// @route  GET /api/admin/student-activity
// @access Private (Faculty or Admin only)
export const getStudentActivity = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const collegeId = req.user.collegeId || process.env.COLLEGE_ID || 'COLLEGE_001';
    const query = { collegeId };

    if (req.query.studentId) {
      query.user = req.query.studentId;
    }
    if (req.query.type && req.query.type !== 'all') {
      query.type = req.query.type;
    }

    const [total, activities] = await Promise.all([
      ActivityLog.countDocuments(query),
      ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email studentId role')
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      activities,
    });
  } catch (error) {
    console.error('[GetStudentActivity Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to retrieve student activity logs',
    });
  }
};

// @desc   Save student practical exam recording & attempt
// @route  POST /api/exam/attempts
// @access Private (Authenticated)
export const saveExamAttempt = async (req, res) => {
  try {
    const {
      practicalId,
      practicalName,
      recordingUrl,
      startedAt,
      finishedAt,
      score,
      flags,
    } = req.body;

    const user = req.user;
    const collegeId = user.collegeId || process.env.COLLEGE_ID || 'COLLEGE_001';

    const examAttempt = await ExamAttempt.create({
      user: user._id,
      userName: user.name || user.email,
      practicalId: practicalId || '',
      practicalName: practicalName || 'Practical Exam',
      recordingUrl: recordingUrl || '',
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      finishedAt: finishedAt ? new Date(finishedAt) : new Date(),
      score: score || 0,
      flags: Array.isArray(flags) ? flags : [],
      flagCount: Array.isArray(flags) ? flags.length : 0,
      status: 'pending',
      collegeId,
    });

    await ActivityLog.create({
      user: user._id,
      userName: user.name || user.email,
      type: 'exam',
      title: `Submitted Exam: ${examAttempt.practicalName}`,
      detail: `Recording uploaded • Status: Pending Review`,
      link: '/faculty',
      colorClass: 'purple',
      collegeId,
    }).catch(() => {});

    return res.status(201).json({
      success: true,
      message: 'Exam attempt submitted successfully for faculty review',
      examAttempt,
    });
  } catch (error) {
    console.error('[SaveExamAttempt Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to submit exam attempt',
    });
  }
};

// @desc   Get all exam attempts for faculty review
// @route  GET /api/admin/exam-attempts
// @access Private (Faculty or Admin only)
export const getExamAttempts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const collegeId = req.user.collegeId || process.env.COLLEGE_ID || 'COLLEGE_001';
    const query = { collegeId };

    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    const [total, exams] = await Promise.all([
      ExamAttempt.countDocuments(query),
      ExamAttempt.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email studentId')
        .populate('reviewedBy', 'name email')
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      exams,
    });
  } catch (error) {
    console.error('[GetExamAttempts Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to retrieve exam attempts',
    });
  }
};

// @desc   Approve or reject student exam attempt (Faculty / Admin)
// @route  PATCH /api/admin/exam-attempts/:id
// @access Private (Faculty or Admin only)
export const updateExamAttemptStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes, score } = req.body;

    const exam = await ExamAttempt.findById(id);
    if (!exam) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Exam attempt not found',
      });
    }

    if (status) exam.status = status;
    if (reviewNotes !== undefined) exam.reviewNotes = reviewNotes;
    if (typeof score === 'number') exam.score = score;
    exam.reviewedBy = req.user._id;
    exam.reviewerName = req.user.name || req.user.email;

    await exam.save();

    return res.status(200).json({
      success: true,
      message: `Exam attempt marked as ${exam.status}`,
      exam,
    });
  } catch (error) {
    console.error('[UpdateExamAttemptStatus Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to update exam attempt',
    });
  }
};

// @desc   Get all student simulation attempts for faculty grading & review
// @route  GET /api/simulation/admin/attempts
// @access Private (Faculty or Admin only)
export const getFacultySimulationAttempts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const skip = (page - 1) * limit;

    const collegeId = req.user.collegeId || process.env.COLLEGE_ID || 'COLLEGE_001';
    const query = { collegeId };

    if (req.query.studentId) query.user = req.query.studentId;
    if (req.query.status && req.query.status !== 'all') query.status = req.query.status;
    if (req.query.practicalName) {
      query.practicalName = { $regex: new RegExp(req.query.practicalName, 'i') };
    }

    const [total, attempts] = await Promise.all([
      SimulationAttempt.countDocuments(query),
      SimulationAttempt.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email studentId role')
        .populate('gradedBy', 'name email')
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      attempts,
    });
  } catch (error) {
    console.error('[GetFacultySimulationAttempts Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to retrieve student simulation attempts',
    });
  }
};

// @desc   Grade or review student simulation attempt (Faculty / Admin only)
// @route  PATCH /api/simulation/admin/attempts/:id
// @access Private (Faculty or Admin only)
export const gradeSimulationAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, grade, facultyRemarks, status, passed } = req.body;

    const attempt = await SimulationAttempt.findById(id);
    if (!attempt) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Simulation attempt not found',
      });
    }

    if (typeof score === 'number') attempt.score = Math.min(100, Math.max(0, score));
    if (typeof passed === 'boolean') attempt.passed = passed;
    if (grade) attempt.grade = grade;
    if (facultyRemarks !== undefined) attempt.facultyRemarks = facultyRemarks;
    if (status) attempt.status = status;
    attempt.gradedBy = req.user._id;
    attempt.gradedByName = req.user.name || req.user.email;
    attempt.gradedAt = new Date();

    await attempt.save();

    return res.status(200).json({
      success: true,
      message: 'Student practical successfully graded by faculty',
      attempt,
    });
  } catch (error) {
    console.error('[GradeSimulationAttempt Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to grade simulation attempt',
    });
  }
};
