import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken } from '../backend/middleware/auth.js';

describe('Ayurlab Authentication & Token Management', () => {
  const mockUser = {
    _id: '67b8a123f4567890abcdef12',
    name: 'Vaidya Scholar',
    email: 'scholar@ayurlab.edu',
    role: 'student',
    collegeId: 'COLLEGE_001',
  };

  it('generates a valid short-lived 15-minute access token', () => {
    const token = generateAccessToken(mockUser);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    const decoded = jwt.decode(token);
    expect(decoded.id).toBe(mockUser._id);
    expect(decoded.role).toBe('student');
    expect(decoded.email).toBe('scholar@ayurlab.edu');

    // Verification that expiry is roughly 15 minutes (900 seconds)
    const lifespanSeconds = decoded.exp - decoded.iat;
    expect(lifespanSeconds).toBe(900);
  });

  it('generates a valid 7-day refresh token with type: refresh', () => {
    const refreshToken = generateRefreshToken(mockUser);
    expect(typeof refreshToken).toBe('string');

    const decoded = jwt.decode(refreshToken);
    expect(decoded.id).toBe(mockUser._id);
    expect(decoded.type).toBe('refresh');

    // 7 days in seconds = 7 * 24 * 3600 = 604800
    const lifespanSeconds = decoded.exp - decoded.iat;
    expect(lifespanSeconds).toBe(604800);
  });
});
