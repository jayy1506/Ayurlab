import Practical from '../models/Practical.js';

// @desc   Get all practicals with pagination and filters
// @route  GET /api/practicals
// @access Public / Authenticated
export const getPracticals = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const query = { isActive: true };

    // College scoping if user is authenticated
    if (req.user?.collegeId) {
      query.$or = [{ collegeId: req.user.collegeId }, { collegeId: { $exists: false } }];
    }

    // Category filter
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    // Search filter
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];
    }

    const [total, practicals] = await Promise.all([
      Practical.countDocuments(query),
      Practical.find(query)
        .sort({ createdAt: -1, name: 1 })
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
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      practicals,
    });
  } catch (error) {
    console.error('[GetPracticals Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to retrieve practicals catalog',
    });
  }
};

// @desc   Get single practical by ID or slug
// @route  GET /api/practicals/:id
// @access Public / Authenticated
export const getPracticalById = async (req, res) => {
  try {
    const { id } = req.params;

    let practical = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      practical = await Practical.findById(id);
    }

    if (!practical) {
      // Fallback search by exact name or name with dashes/underscores
      const normalizedName = id.replace(/[-_]/g, ' ').trim();
      practical = await Practical.findOne({
        name: { $regex: new RegExp(`^${normalizedName}$`, 'i') },
      });
    }

    if (!practical) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Practical experiment not found',
      });
    }

    return res.status(200).json({
      success: true,
      practical,
    });
  } catch (error) {
    console.error('[GetPracticalById Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to retrieve practical details',
    });
  }
};

// @desc   Create new practical experiment (Faculty / Admin)
// @route  POST /api/practicals
// @access Private (Faculty or Admin only)
export const createPractical = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      shlok,
      apparatus,
      ingredients,
      steps,
      precautions,
      siddhiLakshana,
      videoUrl,
      difficulty,
      duration,
    } = req.body;

    const collegeId = req.user.collegeId || process.env.COLLEGE_ID || 'COLLEGE_001';

    // Duplicate check
    const existing = await Practical.findOne({
      name: name.trim(),
      collegeId,
    });

    if (existing) {
      return res.status(409).json({
        error: 'Conflict',
        message: `A practical named "${name}" already exists in this college catalog`,
      });
    }

    const practical = await Practical.create({
      name: name.trim(),
      category: category || 'Churna Kalpana',
      description: description || '',
      shlok: shlok || '',
      apparatus: apparatus || [],
      ingredients: ingredients || [],
      steps: steps || [],
      precautions: precautions || [],
      siddhiLakshana: siddhiLakshana || {},
      videoUrl: videoUrl || '',
      difficulty: difficulty || 'Intermediate',
      duration: duration || '45 mins',
      createdBy: req.user._id,
      collegeId,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Practical experiment created successfully',
      practical,
    });
  } catch (error) {
    console.error('[CreatePractical Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to create practical experiment',
    });
  }
};

// @desc   Update practical experiment (Faculty / Admin)
// @route  PUT /api/practicals/:id
// @access Private (Faculty or Admin only)
export const updatePractical = async (req, res) => {
  try {
    const { id } = req.params;

    const practical = await Practical.findById(id);
    if (!practical) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Practical not found',
      });
    }

    const updateFields = [
      'name',
      'category',
      'description',
      'shlok',
      'apparatus',
      'ingredients',
      'steps',
      'precautions',
      'siddhiLakshana',
      'videoUrl',
      'difficulty',
      'duration',
      'isActive',
    ];

    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        practical[field] = req.body[field];
      }
    });

    await practical.save();

    return res.status(200).json({
      success: true,
      message: 'Practical experiment updated successfully',
      practical,
    });
  } catch (error) {
    console.error('[UpdatePractical Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to update practical experiment',
    });
  }
};

// @desc   Delete practical experiment (Faculty / Admin)
// @route  DELETE /api/practicals/:id
// @access Private (Faculty or Admin only)
export const deletePractical = async (req, res) => {
  try {
    const { id } = req.params;

    const practical = await Practical.findByIdAndDelete(id);
    if (!practical) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Practical experiment not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Practical "${practical.name}" deleted successfully`,
    });
  } catch (error) {
    console.error('[DeletePractical Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to delete practical experiment',
    });
  }
};
