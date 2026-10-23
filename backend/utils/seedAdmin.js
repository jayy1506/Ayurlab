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
    // 1. Primary admin from .env
    const primaryAdminEmail = (process.env.ADMIN_EMAIL || 'jthakre62@gmail.com').toLowerCase().trim();
    const primaryAdminPassword = process.env.ADMIN_PASSWORD || 'Jay@1523';
    const primaryAdminName = process.env.ADMIN_NAME || 'Jay Thakre';

    // 2. Fallback system admin
    const systemAdminEmail = 'admin@college.edu';
    const systemAdminPassword = 'Admin@123456';
    const systemAdminName = 'College Administrator';

    const adminsToSeed = [
      { email: primaryAdminEmail, password: primaryAdminPassword, name: primaryAdminName },
      { email: systemAdminEmail, password: systemAdminPassword, name: systemAdminName },
    ];

    let seededAdmin = null;
    for (const adm of adminsToSeed) {
      let adminUser = await User.findOne({ email: adm.email });
      if (!adminUser) {
        try {
          adminUser = await User.create({
            name: adm.name,
            email: adm.email,
            password: adm.password,
            role: 'admin',
            collegeId,
            isActive: true,
            isDefaultPassword: false,
          });
          console.log(`[SeedAdmin] Administrator created: ${adminUser.email}`);
        } catch (err) {
          if (err.code === 11000) {
            adminUser = await User.findOne({ email: adm.email });
          }
        }
      } else {
        // Guarantee admin account is always active
        if (!adminUser.isActive) {
          adminUser.isActive = true;
          await adminUser.save();
          console.log(`[SeedAdmin] Restored active status for admin: ${adminUser.email}`);
        }
        console.log(`[SeedAdmin] Administrator account verified: ${adminUser.email}`);
      }
      if (!seededAdmin) seededAdmin = adminUser;
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

    return seededAdmin;
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
