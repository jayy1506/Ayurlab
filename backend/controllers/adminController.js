import mongoose from 'mongoose';
import User from '../models/User.js';

// Helper to build flexible, safe user lookup queries that never throw CastError
const buildUserQuery = (id, role, collegeId) => {
  const isMongoId = mongoose.Types.ObjectId.isValid(id);
  const conditions = [];
  if (isMongoId) {
    conditions.push({ _id: id });
  }
  const cleanId = String(id || '').trim();
  if (cleanId) {
    conditions.push({ email: cleanId.toLowerCase() });
    if (role === 'faculty') {
      conditions.push({ facultyId: cleanId });
      conditions.push({ studentId: cleanId });
    } else {
      conditions.push({ studentId: cleanId });
    }
  }

  const query = {
    $or: conditions.length > 0 ? conditions : [{ email: '__no_match__' }],
    role,
  };

  if (collegeId) {
    query.$and = [{ $or: [{ collegeId }, { collegeId: { $exists: false } }] }];
  }

  return query;
};

// @desc   Get all students in the admin's college with pagination and summary stats
// @route  GET /api/admin/students
// @access Private (Admin only)
export const getStudents = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const baseFilter = {
      collegeId,
      role: 'student',
    };

    if (req.query.status === 'active') {
      baseFilter.isActive = true;
    } else if (req.query.status === 'disabled') {
      baseFilter.isActive = false;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      baseFilter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { studentId: searchRegex },
      ];
    }

    const [allCollegeStudents, totalMatched, students] = await Promise.all([
      User.find({ collegeId, role: 'student' }).select('isActive').lean(),
      User.countDocuments(baseFilter),
      User.find(baseFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalStudents = allCollegeStudents.length;
    const activeStudents = allCollegeStudents.filter((s) => s.isActive).length;
    const disabledStudents = totalStudents - activeStudents;
    const totalPages = Math.ceil(totalMatched / limit) || 1;

    return res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        activeStudents,
        disabledStudents,
      },
      pagination: {
        total: totalMatched,
        page,
        limit,
        totalPages,
      },
      students,
    });
  } catch (error) {
    console.error('[GetStudents Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to retrieve students list',
    });
  }
};

// @desc   Create a new student account
// @route  POST /api/admin/students
// @access Private (Admin only)
export const createStudent = async (req, res) => {
  try {
    const { name, email, studentId } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Student name and email are required',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedStudentId = (studentId || '').trim();

    // Check if email already exists
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(409).json({
        error: 'DuplicateEmail',
        message: 'A student or user with this email address already exists',
      });
    }

    // Check if studentId already exists in the same college
    if (trimmedStudentId) {
      const existingStudentId = await User.findOne({
        collegeId: req.user.collegeId,
        studentId: trimmedStudentId,
      });
      if (existingStudentId) {
        return res.status(409).json({
          error: 'DuplicateStudentId',
          message: `Student ID / Roll Number "${trimmedStudentId}" already exists in this college`,
        });
      }
    }

    const defaultPassword = process.env.DEFAULT_STUDENT_PASSWORD || 'BAMS@123';

    // Create student (pre-save hook in User model hashes the password)
    const newStudent = await User.create({
      name: name.trim(),
      email: trimmedEmail,
      studentId: trimmedStudentId,
      password: defaultPassword,
      role: 'student',
      collegeId: req.user.collegeId,
      isActive: true,
      isDefaultPassword: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Student created successfully with default initial password',
      student: newStudent.toJSON(),
    });
  } catch (error) {
    console.error('[CreateStudent Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to create student account',
    });
  }
};

// @desc   Disable a student account
// @route  PATCH /api/admin/students/:id/disable
// @access Private (Admin only)
export const disableStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await User.findOne(buildUserQuery(id, 'student', req.user?.collegeId));

    if (!student) {
      return res.status(404).json({
        error: 'StudentNotFound',
        message: 'Student account not found in this college',
      });
    }

    student.isActive = false;
    await student.save();

    return res.status(200).json({
      success: true,
      message: `Account for ${student.name} has been disabled`,
      student: student.toJSON(),
    });
  } catch (error) {
    console.error('[DisableStudent Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to disable student account',
    });
  }
};

// @desc   Enable a student account
// @route  PATCH /api/admin/students/:id/enable
// @access Private (Admin only)
export const enableStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await User.findOne(buildUserQuery(id, 'student', req.user?.collegeId));

    if (!student) {
      return res.status(404).json({
        error: 'StudentNotFound',
        message: 'Student account not found in this college',
      });
    }

    student.isActive = true;
    await student.save();

    return res.status(200).json({
      success: true,
      message: `Account for ${student.name} has been enabled`,
      student: student.toJSON(),
    });
  } catch (error) {
    console.error('[EnableStudent Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to enable student account',
    });
  }
};

// @desc   Delete a student account permanently
// @route  DELETE /api/admin/students/:id
// @access Private (Admin only)
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await User.findOneAndDelete(buildUserQuery(id, 'student', req.user?.collegeId));

    if (!student) {
      return res.status(404).json({
        error: 'StudentNotFound',
        message: 'Student account not found in this college',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Student account for ${student.name} has been permanently deleted`,
    });
  } catch (error) {
    console.error('[DeleteStudent Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to delete student account',
    });
  }
};

// @desc   Reset a student's password to default initial password
// @route  POST /api/admin/students/:id/reset-password
// @access Private (Admin only)
export const resetStudentPassword = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await User.findOne(buildUserQuery(id, 'student', req.user?.collegeId));

    if (!student) {
      return res.status(404).json({
        error: 'StudentNotFound',
        message: 'Student account not found in this college',
      });
    }

    const defaultPassword = process.env.DEFAULT_STUDENT_PASSWORD || 'BAMS@123';

    student.password = defaultPassword; // Pre-save hook will hash it
    student.isDefaultPassword = true;
    await student.save();

    return res.status(200).json({
      success: true,
      message: `Student password has been reset to default initial password (${defaultPassword})`,
      student: student.toJSON(),
    });
  } catch (error) {
    console.error('[ResetStudentPassword Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to reset student password',
    });
  }
};

// ==========================================
// FACULTY CONTROLLERS (Persistent Database)
// ==========================================

// @desc   Get all faculty in the admin's college with pagination and summary stats
// @route  GET /api/admin/faculty
// @access Private (Admin only)
export const getFaculty = async (req, res) => {
  try {
    const collegeId = req.user?.collegeId || process.env.COLLEGE_ID || 'COLLEGE_001';
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const baseFilter = {
      $or: [{ collegeId }, { collegeId: { $exists: false } }],
      role: 'faculty',
    };

    if (req.query.status === 'active') {
      baseFilter.isActive = true;
    } else if (req.query.status === 'disabled') {
      baseFilter.isActive = false;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      baseFilter.$and = [
        {
          $or: [
            { name: searchRegex },
            { email: searchRegex },
            { facultyId: searchRegex },
          ],
        },
      ];
    }

    const [allCollegeFaculty, totalMatched, faculty] = await Promise.all([
      User.find({ $or: [{ collegeId }, { collegeId: { $exists: false } }], role: 'faculty' }).select('isActive').lean(),
      User.countDocuments(baseFilter),
      User.find(baseFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalFaculty = allCollegeFaculty.length;
    const activeFaculty = allCollegeFaculty.filter((f) => f.isActive).length;
    const disabledFaculty = totalFaculty - activeFaculty;
    const totalPages = Math.ceil(totalMatched / limit) || 1;

    return res.status(200).json({
      success: true,
      stats: {
        totalFaculty,
        activeFaculty,
        disabledFaculty,
      },
      pagination: {
        total: totalMatched,
        page,
        limit,
        totalPages,
      },
      faculty,
    });
  } catch (error) {
    console.error('[GetFaculty Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to retrieve faculty list',
    });
  }
};

// @desc   Create a new faculty account
// @route  POST /api/admin/faculty
// @access Private (Admin only)
export const createFaculty = async (req, res) => {
  try {
    const { name, email, facultyId } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Faculty name and email are required',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedFacultyId = (facultyId || '').trim() || `FAC_${Math.floor(100 + Math.random() * 900)}`;

    // Check if email already exists
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(409).json({
        error: 'DuplicateEmail',
        message: 'A faculty member or user with this email address already exists',
      });
    }

    const defaultPassword = process.env.DEFAULT_STUDENT_PASSWORD || 'Faculty@123';
    const collegeId = req.user?.collegeId || process.env.COLLEGE_ID || 'COLLEGE_001';

    const newFaculty = await User.create({
      name: name.trim(),
      email: trimmedEmail,
      studentId: trimmedFacultyId, // mapped for legacy field
      facultyId: trimmedFacultyId,
      password: defaultPassword,
      role: 'faculty',
      collegeId,
      isActive: true,
      isDefaultPassword: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Faculty member created successfully with default initial password',
      faculty: newFaculty.toJSON(),
    });
  } catch (error) {
    console.error('[CreateFaculty Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to create faculty account',
    });
  }
};

// @desc   Disable a faculty account
// @route  PATCH /api/admin/faculty/:id/disable
// @access Private (Admin only)
export const disableFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await User.findOne(buildUserQuery(id, 'faculty', req.user?.collegeId));

    if (!faculty) {
      return res.status(404).json({
        error: 'FacultyNotFound',
        message: 'Faculty account not found in this college',
      });
    }

    faculty.isActive = false;
    await faculty.save();

    return res.status(200).json({
      success: true,
      message: `Account for ${faculty.name} has been disabled`,
      faculty: faculty.toJSON(),
    });
  } catch (error) {
    console.error('[DisableFaculty Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to disable faculty account',
    });
  }
};

// @desc   Enable a faculty account
// @route  PATCH /api/admin/faculty/:id/enable
// @access Private (Admin only)
export const enableFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await User.findOne(buildUserQuery(id, 'faculty', req.user?.collegeId));

    if (!faculty) {
      return res.status(404).json({
        error: 'FacultyNotFound',
        message: 'Faculty account not found in this college',
      });
    }

    faculty.isActive = true;
    await faculty.save();

    return res.status(200).json({
      success: true,
      message: `Account for ${faculty.name} has been enabled`,
      faculty: faculty.toJSON(),
    });
  } catch (error) {
    console.error('[EnableFaculty Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to enable faculty account',
    });
  }
};

// @desc   Delete a faculty account permanently
// @route  DELETE /api/admin/faculty/:id
// @access Private (Admin only)
export const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await User.findOneAndDelete(buildUserQuery(id, 'faculty', req.user?.collegeId));

    if (!faculty) {
      return res.status(404).json({
        error: 'FacultyNotFound',
        message: 'Faculty account not found in this college',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Faculty account for ${faculty.name} has been permanently deleted`,
    });
  } catch (error) {
    console.error('[DeleteFaculty Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to delete faculty account',
    });
  }
};

// @desc   Reset a faculty's password to default initial password
// @route  POST /api/admin/faculty/:id/reset-password
// @access Private (Admin only)
export const resetFacultyPassword = async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await User.findOne(buildUserQuery(id, 'faculty', req.user?.collegeId));

    if (!faculty) {
      return res.status(404).json({
        error: 'FacultyNotFound',
        message: 'Faculty account not found in this college',
      });
    }

    const defaultPassword = process.env.DEFAULT_STUDENT_PASSWORD || 'Faculty@123';

    faculty.password = defaultPassword;
    faculty.isDefaultPassword = true;
    await faculty.save();

    return res.status(200).json({
      success: true,
      message: `Faculty password has been reset to default initial password (${defaultPassword})`,
      faculty: faculty.toJSON(),
    });
  } catch (error) {
    console.error('[ResetFacultyPassword Error]:', error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Failed to reset faculty password',
    });
  }
};
