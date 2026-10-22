import mongoose from 'mongoose';

const practicalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Practical name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'Churna Kalpana',
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    shlok: {
      type: String,
      default: '',
      trim: true,
    },
    apparatus: {
      type: [String],
      default: [],
    },
    ingredients: [
      {
        name: { type: String, required: true },
        qty: { type: String, default: '' },
        amount: { type: Number, default: 0 },
        ratio: { type: Number, default: 1 },
      },
    ],
    steps: {
      type: [String],
      default: [],
    },
    precautions: {
      type: [String],
      default: [],
    },
    siddhiLakshana: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    videoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    duration: {
      type: String,
      default: '45 mins',
    },
    simulationSteps: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    collegeId: {
      type: String,
      default: () => process.env.COLLEGE_ID || 'COLLEGE_001',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text search index on name, category, and description
practicalSchema.index({ name: 'text', category: 'text', description: 'text' });

const Practical = mongoose.models.Practical || mongoose.model('Practical', practicalSchema);

export default Practical;
