import User from '../models/User.js';

// @desc   Get all students in the admin's college and summary stats
// @route  GET /api/admin/students
// @access Private (Admin only)
export const getStudents = async (req, res) => {
  try {
    const collegeId = req.user.collegeId;

    const students = await User.find({
      collegeId,
      role: 'student',
    }).sort({ createdAt: -1 });

    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.isActive).length;
    const disabledStudents = totalStudents - activeStudents;

    return res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        activeStudents,
        disabledStudents,
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

    const student = await User.findOne({
      _id: id,
      collegeId: req.user.collegeId,
      role: 'student',
    });

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

    const student = await User.findOne({
      _id: id,
      collegeId: req.user.collegeId,
      role: 'student',
    });

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

    const student = await User.findOneAndDelete({
      _id: id,
      collegeId: req.user.collegeId,
      role: 'student',
    });

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

    const student = await User.findOne({
      _id: id,
      collegeId: req.user.collegeId,
      role: 'student',
    });

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
