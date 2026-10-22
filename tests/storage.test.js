import { describe, it, expect } from 'vitest';
import fs from 'fs';
import { generatePresignedUploadUrl, LOCAL_UPLOADS_DIR } from '../backend/utils/cloudStorage.js';

describe('Ayurlab Cloud Storage & Local Fallback', () => {
  it('ensures local uploads directory physically exists', () => {
    expect(fs.existsSync(LOCAL_UPLOADS_DIR)).toBe(true);
  });

  it('generates a valid upload URL configuration', async () => {
    const res = await generatePresignedUploadUrl('exam_recording_test.webm', 'video/webm');
    expect(res).toBeDefined();
    expect(typeof res.uploadUrl).toBe('string');
    expect(res.uploadUrl.length).toBeGreaterThan(0);

    if (res.useS3) {
      expect(res.uploadUrl).toContain('amazonaws.com');
    } else {
      expect(res.uploadUrl).toBe('/api/exam/upload-recording');
    }
  });
});
