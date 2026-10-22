import mongoose from 'mongoose';

const simulationAttemptSchema = new mongoose.Schema(
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
    startedAt: {
      type: Date,
      default: Date.now,
    },
    finishedAt: {
      type: Date,
      default: Date.now,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    mistakes: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    stepLog: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    feedback: {
      type: String,
      default: '',
    },
    grade: {
      type: String,
      default: '', // e.g. 'Uttama (A)', 'Madhyama (B)', 'Heena (C)'
    },
    facultyRemarks: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'graded', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    gradedByName: {
      type: String,
      default: '',
    },
    gradedAt: {
      type: Date,
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

const SimulationAttempt =
  mongoose.models.SimulationAttempt ||
  mongoose.model('SimulationAttempt', simulationAttemptSchema);

export default SimulationAttempt;
