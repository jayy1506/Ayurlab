import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { connectDB } from '../config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const seedAdmin = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@college.edu').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.ADMIN_NAME || 'College Administrator';
    const collegeId = process.env.COLLEGE_ID || 'COLLEGE_001';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      try {
        const createdAdmin = await User.create({
          name: adminName,
          email: adminEmail,
          password: adminPassword,
          role: 'admin',
          collegeId,
          isActive: true,
          isDefaultPassword: false,
        });

        console.log(`[SeedAdmin] Initial College Administrator created: ${createdAdmin.email} (College: ${collegeId})`);
        return createdAdmin;
      } catch (err) {
        if (err.code === 11000) {
          return await User.findOne({ email: adminEmail });
        }
        throw err;
      }
    } else {
      console.log(`[SeedAdmin] Administrator account verified: ${existingAdmin.email}`);
    }

    // Seed default Faculty account so faculty is always present on restart
    const facultyEmail = (process.env.DEFAULT_FACULTY_EMAIL || 'faculty@college.edu').toLowerCase().trim();
    const existingFaculty = await User.findOne({ email: facultyEmail });
    if (!existingFaculty) {
      try {
        const createdFaculty = await User.create({
          name: 'Dr. V. K. Sharma',
          email: facultyEmail,
          studentId: 'FAC_001',
          facultyId: 'FAC_001',
          password: process.env.DEFAULT_FACULTY_PASSWORD || 'Faculty@123',
          role: 'faculty',
          collegeId,
          isActive: true,
          isDefaultPassword: false,
        });
        console.log(`[SeedAdmin] Initial Faculty created: ${createdFaculty.email}`);
      } catch (fErr) {
        if (fErr.code !== 11000) console.warn('[SeedAdmin] Faculty seed notice:', fErr.message);
      }
    } else {
      console.log(`[SeedAdmin] Faculty account verified: ${existingFaculty.email}`);
    }

    return existingAdmin;
  } catch (error) {
    console.error('[SeedAdmin Error]:', error.message);
    throw error;
  }
};

// Run standalone if executed directly via node
if (process.argv[1] && process.argv[1].includes('seedAdmin.js')) {
  (async () => {
    try {
      await connectDB();
      await seedAdmin();
      console.log('[SeedAdmin] Seeding completed.');
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('[SeedAdmin Failed]:', err);
      process.exit(1);
    }
  })();
}
