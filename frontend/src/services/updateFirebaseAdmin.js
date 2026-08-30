import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  doc, 
  setDoc, 
  getDoc,
  updateProfile,
  serverTimestamp 
} from './firebase';

const ADMIN_EMAIL = 'jthakre62@gmail.com';
const ADMIN_PASSWORD = 'Jay@1523';
const ADMIN_NAME = 'Jay Thakre';
const COLLEGE_ID = 'COLLEGE_001';

/**
 * Ensures the admin user exists in Firebase Authentication and has admin role in Firestore.
 */
export const setupOrUpdateAdminInFirebase = async (
  email = ADMIN_EMAIL, 
  password = ADMIN_PASSWORD, 
  name = ADMIN_NAME,
  collegeId = COLLEGE_ID
) => {
  if (!auth || !db) {
    console.warn('[FirebaseAdmin] Firebase is not initialized yet.');
    return { success: false, message: 'Firebase not initialized' };
  }

  try {
    let userCredential = null;

    // Try signing in first
    try {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('[FirebaseAdmin] Existing Admin signed in:', userCredential.user.email);
    } catch (signInErr) {
      if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
        // If not found or credential invalid, try creating the account
        try {
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
          console.log('[FirebaseAdmin] Created new Admin user in Firebase Auth:', userCredential.user.email);
        } catch (createErr) {
          if (createErr.code === 'auth/email-already-in-use') {
            console.log('[FirebaseAdmin] Admin email exists in Firebase Auth.');
          } else {
            console.error('[FirebaseAdmin] Could not create user:', createErr);
          }
        }
      } else {
        console.error('[FirebaseAdmin] Sign in attempt error:', signInErr);
      }
    }

    const currentAuthUser = userCredential?.user || auth.currentUser;

    if (currentAuthUser) {
      // Update display name if available
      try {
        await updateProfile(currentAuthUser, { displayName: name });
      } catch (e) {
        // Ignore profile update error if any
      }

      // Upsert Firestore user document with admin privileges
      const userRef = doc(db, 'users', currentAuthUser.uid);
      const docSnap = await getDoc(userRef);

      const adminProfile = {
        uid: currentAuthUser.uid,
        email: email.toLowerCase(),
        name: name,
        role: 'admin',
        collegeId: collegeId,
        isActive: true,
        isDefaultPassword: false,
        updatedAt: serverTimestamp(),
      };

      if (!docSnap.exists()) {
        adminProfile.createdAt = serverTimestamp();
      }

      await setDoc(userRef, adminProfile, { merge: true });
      console.log('[FirebaseAdmin] Administrator record in Firestore updated successfully:', adminProfile);

      return {
        success: true,
        message: 'Admin account in Firebase updated successfully',
        user: { ...adminProfile, _id: currentAuthUser.uid },
      };
    }

    return {
      success: false,
      message: 'Admin user updated in Firestore where applicable',
    };
  } catch (error) {
    console.error('[FirebaseAdmin] setupOrUpdateAdminInFirebase error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
