import mongoose from 'mongoose';

const aiInteractionSchema = new mongoose.Schema(
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
    practical: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Practical',
      index: true,
    },
    practicalId: {
      type: String,
      default: '',
    },
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, 'Answer text is required'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    feedback: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
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

const AIInteraction =
  mongoose.models.AIInteraction ||
  mongoose.model('AIInteraction', aiInteractionSchema);

export default AIInteraction;
