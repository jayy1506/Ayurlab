import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Practical from '../models/Practical.js';
import User from '../models/User.js';
import practicalsData from '../../frontend/src/data/learningPracticals.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

/**
 * Automatically categorizes Ayurvedic formulations based on classical naming
 */
function inferCategory(title) {
  const t = (title || '').toLowerCase();
  if (t.includes('churna')) return 'Churna Kalpana';
  if (t.includes('vati') || t.includes('gutika')) return 'Vati Kalpana';
  if (t.includes('guggulu')) return 'Guggulu Kalpana';
  if (t.includes('ghrita')) return 'Sneha Kalpana (Ghrita)';
  if (t.includes('taila')) return 'Sneha Kalpana (Taila)';
  if (t.includes('asava') || t.includes('arishta')) return 'Sandhana Kalpana';
  if (t.includes('avaleha') || t.includes('khanda')) return 'Avaleha Kalpana';
  if (t.includes('kwatha') || t.includes('kashaya')) return 'Kwatha Kalpana';
  if (t.includes('parpati')) return 'Parpati Kalpana';
  if (t.includes('bhasma') || t.includes('pishti')) return 'Bhasma Kalpana';
  if (t.includes('shodhana')) return 'Shodhana Kalpana';
  if (t.includes('satva')) return 'Satva Kalpana';
  if (t.includes('lepa') || t.includes('malahara')) return 'Lepa & Malahara';
  if (t.includes('pariksha') || t.includes('test') || t.includes('ph') || t.includes('gravity') || t.includes('index')) {
    return 'Quality Testing & Analysis';
  }
  return 'General Bhaishajya Kalpana';
}

export const seedPracticals = async () => {
  try {
    const collegeId = process.env.COLLEGE_ID || 'COLLEGE_001';
    console.log(`[SeedPracticals] Starting practicals synchronization for college: ${collegeId}...`);

    // Find default admin to associate as createdBy
    const adminUser = await User.findOne({ role: 'admin', collegeId });
    const adminId = adminUser ? adminUser._id : null;

    let upsertedCount = 0;

    for (const item of practicalsData) {
      if (!item.title) continue;

      const category = inferCategory(item.title);
      const ingredients = (item.rawIngredients || []).map((ing) => ({
        name: ing.name || 'Ingredient',
        qty: ing.qty || '',
      }));

      const practicalDoc = {
        name: item.title.trim(),
        category,
        description: item.description || '',
        shlok: item.shlok || '',
        apparatus: Array.isArray(item.apparatus) ? item.apparatus : [],
        ingredients,
        steps: Array.isArray(item.steps) ? item.steps : [],
        precautions: Array.isArray(item.precautions) ? item.precautions : [],
        siddhiLakshana: item.observations || {},
        videoUrl: item.videoUrl || '',
        createdBy: adminId,
        collegeId,
        isActive: true,
      };

      await Practical.findOneAndUpdate(
        { name: practicalDoc.name, collegeId },
        { $set: practicalDoc },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );

      upsertedCount++;
    }

    console.log(`[SeedPracticals] Successfully synced ${upsertedCount} classical practicals into MongoDB!`);
    return upsertedCount;
  } catch (error) {
    console.error('[SeedPracticals Error]:', error.message);
    throw error;
  }
};

// Direct script execution support
if (process.argv[1] && process.argv[1].endsWith('seedPracticals.js')) {
  connectDB()
    .then(() => seedPracticals())
    .then((count) => {
      console.log(`[SeedPracticals CLI] Finished seeding ${count} practicals.`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[SeedPracticals CLI Failed]:', err);
      process.exit(1);
    });
}
