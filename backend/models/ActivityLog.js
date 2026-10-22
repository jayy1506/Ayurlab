import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    userName: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['practical', 'exam', 'ai_tutor', 'auth', 'admin'],
      default: 'practical',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true,
    },
    detail: {
      type: String,
      default: '',
      trim: true,
    },
    link: {
      type: String,
      default: '',
    },
    colorClass: {
      type: String,
      default: 'green',
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

const ActivityLog =
  mongoose.models.ActivityLog ||
  mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
