import mongoose from 'mongoose';

const examAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    userName: {
      type: String,
      default: '',
    },
    practical: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Practical',
      index: true,
    },
    practicalId: {
      type: String,
      default: '',
    },
    practicalName: {
      type: String,
      required: [true, 'Practical name is required'],
    },
    recordingUrl: {
      type: String,
      default: '',
    },
    recordingDeletedAt: {
      type: Date,
      default: null,
    },
    consentGiven: {
      type: Boolean,
      default: false,
    },
    consentTimestamp: {
      type: Date,
      default: null,
    },
    consentVersion: {
      type: String,
      default: '1.0',
    },
    examModeType: {
      type: String,
      enum: ['video_proctored', 'faculty_supervised'],
      default: 'video_proctored',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    finishedAt: {
      type: Date,
      default: Date.now,
    },
    score: {
      type: Number,
      default: 0,
    },
    flags: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    flagCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'interrupted'],
      default: 'pending',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewerName: {
      type: String,
      default: '',
    },
    reviewNotes: {
      type: String,
      default: '',
    },
    collegeId: {
      type: String,
      default: () => process.env.COLLEGE_ID || 'COLLEGE_001',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const ExamAttempt =
  mongoose.models.ExamAttempt ||
  mongoose.model('ExamAttempt', examAttemptSchema);

export default ExamAttempt;
