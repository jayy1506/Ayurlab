import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import app from './server.js';
import User from './models/User.js';
import { connectDB } from './config/db.js';
import { seedAdmin } from './utils/seedAdmin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

let server;
const PORT = 5055;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const runTests = async () => {
  console.log('--- STARTING COMPREHENSIVE AUTHENTICATION & ADMIN FLOW TEST ---');
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    await connectDB();
    await seedAdmin();

    // Clean any prior test student data
    await User.deleteMany({ email: { $in: ['test_student@college.edu', 'other_college@college.edu'] } });

    server = app.listen(PORT);
    console.log(`Test server running on port ${PORT}`);

    // Helper for requests
    const api = async (endpoint, method = 'GET', body = null, token = null) => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
      });

      let data;
      try {
        data = await res.json();
      } catch (e) {
        data = null;
      }
      return { status: res.status, data };
    };

    // 1. Admin login with correct credentials
    const adminLoginRes = await api('/api/auth/login', 'POST', {
      email: 'admin@college.edu',
      password: 'Admin@123456',
    });
    assert(adminLoginRes.status === 200 && adminLoginRes.data?.token && adminLoginRes.data?.user?.role === 'admin', '1. Admin login with valid credentials');
    const adminToken = adminLoginRes.data?.token;

    // 2. Admin login with wrong password
    const adminBadLogin = await api('/api/auth/login', 'POST', {
      email: 'admin@college.edu',
      password: 'WrongPassword!',
    });
    assert(adminBadLogin.status === 401, '2. Admin login with incorrect password returns 401');

    // 3. Admin view students list
    const studentListRes = await api('/api/admin/students', 'GET', null, adminToken);
    assert(studentListRes.status === 200 && Array.isArray(studentListRes.data?.students), '3. Admin fetch student list & stats');

    // 4. Admin creates a new student
    const createRes = await api('/api/admin/students', 'POST', {
      name: 'Rahul Sharma',
      email: 'test_student@college.edu',
      studentId: 'BAMS_2026_001',
    }, adminToken);
    assert(
      createRes.status === 201 &&
      createRes.data?.student?.isDefaultPassword === true &&
      createRes.data?.student?.role === 'student' &&
      createRes.data?.student?.collegeId === 'COLLEGE_001',
      '4. Admin creates student with auto-assigned default password (isDefaultPassword: true)'
    );
    const createdStudentId = createRes.data?.student?._id;

    // 5. Duplicate student creation returns 409
    const dupRes = await api('/api/admin/students', 'POST', {
      name: 'Rahul Sharma Duplicate',
      email: 'test_student@college.edu',
      studentId: 'BAMS_2026_001',
    }, adminToken);
    assert(dupRes.status === 409, '5. Duplicate student registration returns 409 Conflict');

    // 6. Student login with default password BAMS@123
    const stuLoginRes = await api('/api/auth/login', 'POST', {
      email: 'test_student@college.edu',
      password: 'BAMS@123',
    });
    assert(
      stuLoginRes.status === 200 &&
      stuLoginRes.data?.token &&
      stuLoginRes.data?.user?.isDefaultPassword === true,
      '6. Student logs in with default password BAMS@123'
    );
    const studentToken = stuLoginRes.data?.token;

    // 7. Student unauthorized access to admin endpoint
    const stuAdminAttempt = await api('/api/admin/students', 'GET', null, studentToken);
    assert(stuAdminAttempt.status === 403, '7. Student accessing admin endpoint is blocked with 403 Forbidden');

    // 8. Student changes password
    const changePassRes = await api('/api/auth/change-password', 'POST', {
      currentPassword: 'BAMS@123',
      newPassword: 'NewSecurePassword@2026',
      confirmPassword: 'NewSecurePassword@2026',
    }, studentToken);
    assert(
      changePassRes.status === 200 &&
      changePassRes.data?.user?.isDefaultPassword === false,
      '8. Student changes password successfully (isDefaultPassword becomes false)'
    );

    // 9. Old default password fails
    const oldPassLogin = await api('/api/auth/login', 'POST', {
      email: 'test_student@college.edu',
      password: 'BAMS@123',
    });
    assert(oldPassLogin.status === 401, '9. Old default password rejected after password change');

    // 10. Login with new password succeeds
    const newPassLogin = await api('/api/auth/login', 'POST', {
      email: 'test_student@college.edu',
      password: 'NewSecurePassword@2026',
    });
    assert(newPassLogin.status === 200 && newPassLogin.data?.user?.isDefaultPassword === false, '10. Login with new password succeeds');
    const updatedStudentToken = newPassLogin.data?.token;

    // 11. Admin resets student password
    const resetRes = await api(`/api/admin/students/${createdStudentId}/reset-password`, 'POST', null, adminToken);
    assert(
      resetRes.status === 200 &&
      resetRes.data?.student?.isDefaultPassword === true,
      '11. Admin resets student password back to default'
    );

    // 12. Student can login again with default password
    const resetStuLogin = await api('/api/auth/login', 'POST', {
      email: 'test_student@college.edu',
      password: 'BAMS@123',
    });
    assert(resetStuLogin.status === 200 && resetStuLogin.data?.user?.isDefaultPassword === true, '12. Student logs in with restored default password');

    // 13. Admin disables student account
    const disableRes = await api(`/api/admin/students/${createdStudentId}/disable`, 'PATCH', null, adminToken);
    assert(disableRes.status === 200 && disableRes.data?.student?.isActive === false, '13. Admin disables student account');

    // 14. Disabled student login is rejected with 403
    const disabledLogin = await api('/api/auth/login', 'POST', {
      email: 'test_student@college.edu',
      password: 'BAMS@123',
    });
    assert(disabledLogin.status === 403, '14. Disabled student login is rejected with 403 Forbidden');

    // 15. Disabled student token access is rejected
    const disabledTokenAccess = await api('/api/auth/me', 'GET', null, resetStuLogin.data?.token);
    assert(disabledTokenAccess.status === 403, '15. Disabled student token access rejected with 403');

    // 16. Admin enables student account
    const enableRes = await api(`/api/admin/students/${createdStudentId}/enable`, 'PATCH', null, adminToken);
    assert(enableRes.status === 200 && enableRes.data?.student?.isActive === true, '16. Admin re-enables student account');

    // 17. Re-enabled student login succeeds
    const reEnabledLogin = await api('/api/auth/login', 'POST', {
      email: 'test_student@college.edu',
      password: 'BAMS@123',
    });
    assert(reEnabledLogin.status === 200 && reEnabledLogin.data?.user?.isActive === true, '17. Re-enabled student can log in');

    // 18. College Isolation: user with another collegeId is rejected
    await User.create({
      name: 'Other College Student',
      email: 'other_college@college.edu',
      password: 'Password@123',
      role: 'student',
      collegeId: 'COLLEGE_999',
      isActive: true,
      isDefaultPassword: false,
    });
    const wrongCollegeLogin = await api('/api/auth/login', 'POST', {
      email: 'other_college@college.edu',
      password: 'Password@123',
    });
    assert(wrongCollegeLogin.status === 403, '18. User from unauthorized collegeId (COLLEGE_999) rejected with 403');

    // 19. Public registration endpoint does not exist
    const publicRegisterAttempt = await api('/api/auth/register', 'POST', {
      name: 'Hacker',
      email: 'hacker@college.edu',
      password: 'HackPassword123',
    });
    assert(publicRegisterAttempt.status === 404, '19. Public registration endpoint is completely absent (404)');

    // 20. Admin deletes student account
    const deleteRes = await api(`/api/admin/students/${createdStudentId}`, 'DELETE', null, adminToken);
    assert(deleteRes.status === 200, '20. Admin permanently deletes student account');

    // Cleanup other user
    await User.deleteMany({ email: { $in: ['test_student@college.edu', 'other_college@college.edu'] } });

    console.log(`\n========================================`);
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

  } catch (error) {
    console.error('Test execution error:', error);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();
