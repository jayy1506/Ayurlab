import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const API_KEY = process.env.VITE_FIREBASE_API_KEY;
const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'aayurveda-ae9eb';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'jthakre62@gmail.com').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Jay@1523';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Jay Thakre';
const COLLEGE_ID = process.env.COLLEGE_ID || 'COLLEGE_001';

export const updateAdminInFirebase = async () => {
  if (!API_KEY) {
    throw new Error('Missing VITE_FIREBASE_API_KEY in .env');
  }

  console.log(`[FirebaseSetup] Initializing/Updating Admin for: ${ADMIN_EMAIL}...`);

  let idToken = null;
  let localId = null;

  // 1. Try Signing in with email/password
  try {
    const signInRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          returnSecureToken: true,
        }),
      }
    );

    const signInData = await signInRes.json();

    if (signInRes.ok) {
      console.log(`[FirebaseSetup] Admin user exists in Firebase Auth (UID: ${signInData.localId})`);
      idToken = signInData.idToken;
      localId = signInData.localId;
    } else {
      console.log(`[FirebaseSetup] Sign in response: ${signInData.error?.message}. Attempting signup...`);
      
      // 2. Try creating user if not exists or password differs
      const signUpRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            returnSecureToken: true,
          }),
        }
      );

      const signUpData = await signUpRes.json();

      if (signUpRes.ok) {
        console.log(`[FirebaseSetup] Created new Admin user in Firebase Auth (UID: ${signUpData.localId})`);
        idToken = signUpData.idToken;
        localId = signUpData.localId;
      } else if (signUpData.error?.message?.includes('EMAIL_EXISTS')) {
        console.log('[FirebaseSetup] Email already exists. Setting displayName...');
      } else {
        throw new Error(signUpData.error?.message || 'Failed to create Firebase user');
      }
    }
  } catch (authErr) {
    console.warn('[FirebaseSetup] Firebase Auth step note:', authErr.message);
  }

  // 3. Update Display Name if idToken obtained
  if (idToken) {
    try {
      await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken,
            displayName: ADMIN_NAME,
            returnSecureToken: true,
          }),
        }
      );
      console.log(`[FirebaseSetup] Updated Firebase Auth display name: ${ADMIN_NAME}`);
    } catch (e) {
      console.warn('[FirebaseSetup] Could not update display name in Auth:', e.message);
    }
  }

  // 4. Update Admin Document in Firestore
  if (localId && idToken) {
    try {
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${localId}?currentDocument.exists=true`;
      
      // Try patch/write to Firestore
      const patchUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${localId}`;
      const docBody = {
        fields: {
          uid: { stringValue: localId },
          email: { stringValue: ADMIN_EMAIL },
          name: { stringValue: ADMIN_NAME },
          role: { stringValue: 'admin' },
          collegeId: { stringValue: COLLEGE_ID },
          isActive: { booleanValue: true },
          isDefaultPassword: { booleanValue: false },
          updatedAt: { timestampValue: new Date().toISOString() },
        },
      };

      const docRes = await fetch(patchUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(docBody),
      });

      const docData = await docRes.json();
      if (docRes.ok) {
        console.log('[FirebaseSetup] Admin user profile document updated in Firestore!');
      } else {
        console.log('[FirebaseSetup] Firestore document update note:', docData.error?.message || docData);
      }
    } catch (fsErr) {
      console.warn('[FirebaseSetup] Firestore update note:', fsErr.message);
    }
  }

  console.log(`[FirebaseSetup] Admin setup completed successfully for ${ADMIN_EMAIL}.`);
  return { success: true, email: ADMIN_EMAIL, name: ADMIN_NAME, role: 'admin' };
};

// If run directly via node
if (process.argv[1] && process.argv[1].includes('updateFirebaseAdmin.js')) {
  updateAdminInFirebase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[FirebaseSetup Failed]:', err);
      process.exit(1);
    });
}
