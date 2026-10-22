import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isUserAuthorizedForExam } from '../backend/controllers/examController.js';
import { cleanExpiredRecordings } from '../backend/jobs/recordingCleanup.js';
import ExamAttempt from '../backend/models/ExamAttempt.js';
import Practical from '../backend/models/Practical.js';
import * as cloudStorage from '../backend/utils/cloudStorage.js';

describe('Exam Mode Privacy Controls & Access Restrictions', () => {
  const adminUser = {
    _id: '67b8a123f4567890abcdef01',
    role: 'admin',
    name: 'Lab Admin',
    email: 'admin@ayurlab.edu',
  };

  const facultyOwner = {
    _id: '67b8a123f4567890abcdef02',
    role: 'faculty',
    name: 'Dr. Charaka',
    email: 'charaka@ayurlab.edu',
  };

  const facultyNonOwner = {
    _id: '67b8a123f4567890abcdef03',
    role: 'faculty',
    name: 'Dr. Sushruta',
    email: 'sushruta@ayurlab.edu',
  };

  const studentUser = {
    _id: '67b8a123f4567890abcdef04',
    role: 'student',
    name: 'Student Scholar',
    email: 'student@ayurlab.edu',
  };

  const mockAttempt = {
    _id: '67b8a123f4567890abcdef99',
    userName: 'Student Scholar',
    practicalId: '67b8a123f4567890abcdef10',
    practicalName: 'Triphala Churna Preparation',
    recordingUrl: '/uploads/exam_recordings/exam_123.webm',
    consentGiven: true,
    consentVersion: '1.0',
    consentTimestamp: new Date(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Recording Access Authorization (Requirement 4)', () => {
    it('allows platform administrators full access to exam recordings', async () => {
      const authorized = await isUserAuthorizedForExam(adminUser, mockAttempt);
      expect(authorized).toBe(true);
    });

    it('allows faculty who own the course (createdBy matches) to access recording', async () => {
      vi.spyOn(Practical, 'findById').mockResolvedValue({
        _id: mockAttempt.practicalId,
        name: mockAttempt.practicalName,
        createdBy: facultyOwner._id,
      });

      const authorized = await isUserAuthorizedForExam(facultyOwner, mockAttempt);
      expect(authorized).toBe(true);
    });

    it('denies faculty who do not own the course (createdBy does not match)', async () => {
      vi.spyOn(Practical, 'findById').mockResolvedValue({
        _id: mockAttempt.practicalId,
        name: mockAttempt.practicalName,
        createdBy: facultyOwner._id, // Owned by Dr. Charaka, not Dr. Sushruta
      });

      const authorized = await isUserAuthorizedForExam(facultyNonOwner, mockAttempt);
      expect(authorized).toBe(false);
    });

    it('denies students from accessing other students exam recordings', async () => {
      const authorized = await isUserAuthorizedForExam(studentUser, mockAttempt);
      expect(authorized).toBe(false);
    });

    it('denies unauthenticated requests from accessing recordings', async () => {
      const authorized = await isUserAuthorizedForExam(null, mockAttempt);
      expect(authorized).toBe(false);
    });
  });

  describe('2. Consent Tracking & Alternative Supervised Path (Requirements 1 & 3)', () => {
    it('validates schema allows storing consent timestamp, version, and faculty_supervised mode', () => {
      const videoAttempt = new ExamAttempt({
        user: studentUser._id,
        userName: studentUser.name,
        practicalName: 'Churna Preparation',
        recordingUrl: '/uploads/exam_recordings/test.webm',
        consentGiven: true,
        consentTimestamp: new Date('2026-10-21T10:00:00Z'),
        consentVersion: '1.0',
        examModeType: 'video_proctored',
      });

      expect(videoAttempt.consentGiven).toBe(true);
      expect(videoAttempt.consentVersion).toBe('1.0');
      expect(videoAttempt.consentTimestamp).toBeInstanceOf(Date);
      expect(videoAttempt.examModeType).toBe('video_proctored');
    });

    it('correctly models the faculty-supervised alternative path when recording is declined', () => {
      const supervisedAttempt = new ExamAttempt({
        user: studentUser._id,
        userName: studentUser.name,
        practicalName: 'Churna Preparation',
        recordingUrl: '', // Camera disabled
        consentGiven: false,
        consentTimestamp: null,
        examModeType: 'faculty_supervised',
      });

      expect(supervisedAttempt.consentGiven).toBe(false);
      expect(supervisedAttempt.examModeType).toBe('faculty_supervised');
      expect(supervisedAttempt.recordingUrl).toBe('');
    });
  });

  describe('3. Scheduled Recording Retention Cleanup (Requirement 2)', () => {
    it('deletes recordings older than retention period and clears URL', async () => {
      const mockExpiredAttempt = {
        _id: 'attempt_expired_001',
        userName: 'Ayu Student',
        practicalName: 'Bhasma SOP',
        recordingUrl: '/uploads/exam_recordings/old_exam.webm',
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 40 days old
        save: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(ExamAttempt, 'find').mockResolvedValue([mockExpiredAttempt]);
      const deleteSpy = vi.spyOn(cloudStorage, 'deleteRecordingFile').mockResolvedValue({
        success: true,
        storage: 'local',
      });

      const result = await cleanExpiredRecordings({ retentionDaysOverride: 30 });

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(1);
      expect(deleteSpy).toHaveBeenCalledWith('/uploads/exam_recordings/old_exam.webm');
      expect(mockExpiredAttempt.recordingUrl).toBe('');
      expect(mockExpiredAttempt.recordingDeletedAt).toBeInstanceOf(Date);
      expect(mockExpiredAttempt.save).toHaveBeenCalled();
    });

    it('does not touch active recordings within the retention window', async () => {
      vi.spyOn(ExamAttempt, 'find').mockResolvedValue([]);
      const deleteSpy = vi.spyOn(cloudStorage, 'deleteRecordingFile');

      const result = await cleanExpiredRecordings({ retentionDaysOverride: 30 });

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(0);
      expect(deleteSpy).not.toHaveBeenCalled();
    });
  });
});
