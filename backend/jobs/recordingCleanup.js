import ExamAttempt from '../models/ExamAttempt.js';
import { deleteRecordingFile } from '../utils/cloudStorage.js';
import { logger } from '../utils/logger.js';

/**
 * Executes a cleanup pass of exam recordings that exceed RECORDING_RETENTION_DAYS.
 * - Deletes the physical file (AWS S3 or local uploads directory).
 * - Clears recordingUrl and records recordingDeletedAt timestamp.
 * - Logs each deletion with structured metadata.
 * 
 * @param {Object} options
 * @param {number} [options.retentionDaysOverride] - Optional override for retention days (e.g., during tests)
 * @returns {Promise<{ success: boolean, deletedCount: number, cutoffDate: Date, retentionDays: number }>}
 */
export async function cleanExpiredRecordings({ retentionDaysOverride } = {}) {
  const retentionDays =
    typeof retentionDaysOverride === 'number'
      ? retentionDaysOverride
      : parseInt(process.env.RECORDING_RETENTION_DAYS || '30', 10);

  const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  try {
    const expiredAttempts = await ExamAttempt.find({
      recordingUrl: { $exists: true, $nin: ['', null] },
      createdAt: { $lt: cutoffDate },
    });

    let deletedCount = 0;

    for (const attempt of expiredAttempts) {
      const previousUrl = attempt.recordingUrl;
      const fileResult = await deleteRecordingFile(previousUrl);

      attempt.recordingUrl = '';
      attempt.recordingDeletedAt = new Date();
      await attempt.save();

      deletedCount++;
      logger.info(`[ExamRecordingRetention] Deleted expired exam recording`, {
        attemptId: attempt._id.toString(),
        studentName: attempt.userName,
        practicalName: attempt.practicalName,
        previousUrl,
        storageType: fileResult.storage,
        retentionDays,
        createdAt: attempt.createdAt,
        deletedAt: attempt.recordingDeletedAt,
      });
    }

    return {
      success: true,
      deletedCount,
      cutoffDate,
      retentionDays,
    };
  } catch (error) {
    logger.error('[ExamRecordingRetention Error] Failed to run recording retention cleanup:', error);
    throw error;
  }
}

/**
 * Initializes the recurring background scheduled job to run retention cleanup.
 * Defaults to running once every 24 hours.
 * 
 * @param {number} [intervalMs=86400000] - Interval between cleanup runs (default: 24h)
 * @returns {NodeJS.Timeout} - Interval reference
 */
export function startRecordingRetentionSchedule(intervalMs = 24 * 60 * 60 * 1000) {
  const retentionDays = process.env.RECORDING_RETENTION_DAYS || '30';
  logger.info(`[ExamRecordingRetention] Scheduled retention cleaner started (retention: ${retentionDays} days, interval: ${intervalMs / 1000}s)`);

  // Run initial pass shortly after server start (e.g. 10 seconds)
  setTimeout(() => {
    cleanExpiredRecordings().catch((err) => {
      logger.error('[ExamRecordingRetention Initial Run Error]:', err);
    });
  }, 10000);

  // Recurring job
  const interval = setInterval(() => {
    cleanExpiredRecordings().catch((err) => {
      logger.error('[ExamRecordingRetention Scheduled Run Error]:', err);
    });
  }, intervalMs);

  // Allow Node process to exit gracefully without keeping event loop alive
  if (interval.unref) {
    interval.unref();
  }

  return interval;
}
