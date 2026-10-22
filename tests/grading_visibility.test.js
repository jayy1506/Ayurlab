import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getFacultySimulationAttempts,
  gradeSimulationAttempt,
} from '../backend/controllers/simulationController.js';
import SimulationAttempt from '../backend/models/SimulationAttempt.js';
import { requireFacultyOrAdmin } from '../backend/middleware/auth.js';

describe('Grading Visibility & Academic Role Authorization', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const studentUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Student Scholar',
    email: 'student@ayurveda.edu',
    role: 'student',
    collegeId: 'COLLEGE_001',
  };

  const facultyUser = {
    _id: '507f1f77bcf86cd799439022',
    name: 'Dr. Charaka (Faculty)',
    email: 'faculty@ayurveda.edu',
    role: 'faculty',
    collegeId: 'COLLEGE_001',
  };

  const adminUser = {
    _id: '507f1f77bcf86cd799439033',
    name: 'Lab Admin',
    email: 'admin@ayurveda.edu',
    role: 'admin',
    collegeId: 'COLLEGE_001',
  };

  it('1. Blocks students from accessing faculty grading endpoints with 403 Forbidden', () => {
    const req = { user: studentUser };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    requireFacultyOrAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Forbidden',
        message: expect.stringContaining('Faculty or Administrator privileges are required'),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('2. Grants access to faculty and admins for grading evaluation', () => {
    const reqFaculty = { user: facultyUser };
    const resFaculty = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const nextFaculty = vi.fn();

    requireFacultyOrAdmin(reqFaculty, resFaculty, nextFaculty);
    expect(nextFaculty).toHaveBeenCalled();

    const reqAdmin = { user: adminUser };
    const resAdmin = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const nextAdmin = vi.fn();

    requireFacultyOrAdmin(reqAdmin, resAdmin, nextAdmin);
    expect(nextAdmin).toHaveBeenCalled();
  });

  it('3. Allows faculty to fetch all student practical submissions', async () => {
    const mockAttempts = [
      {
        _id: 'att_001',
        userName: 'Student Scholar',
        practicalName: 'Triphala Churna',
        score: 85,
        status: 'pending',
      },
    ];

    vi.spyOn(SimulationAttempt, 'countDocuments').mockResolvedValue(1);
    vi.spyOn(SimulationAttempt, 'find').mockReturnValue({
      sort: vi.fn().mockReturnValue({
        skip: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            populate: vi.fn().mockReturnValue({
              populate: vi.fn().mockReturnValue({
                lean: vi.fn().mockResolvedValue(mockAttempts),
              }),
            }),
          }),
        }),
      }),
    });

    const req = {
      user: facultyUser,
      query: { page: '1', limit: '20' },
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await getFacultySimulationAttempts(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        attempts: mockAttempts,
      })
    );
  });

  it('4. Allows faculty to grade an attempt and update official marks, letter grade, and remarks', async () => {
    const mockAttemptDoc = {
      _id: 'att_001',
      score: 75,
      passed: false,
      status: 'pending',
      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(SimulationAttempt, 'findById').mockResolvedValue(mockAttemptDoc);

    const req = {
      user: facultyUser,
      params: { id: 'att_001' },
      body: {
        score: 95,
        grade: 'Uttama (A)',
        facultyRemarks: 'Flawless organoleptic criteria achieved.',
        status: 'approved',
        passed: true,
      },
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await gradeSimulationAttempt(req, res);

    expect(mockAttemptDoc.score).toBe(95);
    expect(mockAttemptDoc.grade).toBe('Uttama (A)');
    expect(mockAttemptDoc.facultyRemarks).toBe('Flawless organoleptic criteria achieved.');
    expect(mockAttemptDoc.status).toBe('approved');
    expect(mockAttemptDoc.passed).toBe(true);
    expect(mockAttemptDoc.gradedByName).toBe('Dr. Charaka (Faculty)');
    expect(mockAttemptDoc.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
