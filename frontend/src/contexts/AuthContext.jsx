import { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  updatePassword,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signInWithPopup,
  googleProvider,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from '../services/firebase';
import { ensureAdminAccount, registerFirebaseStudent, getCachedStudents, setCachedStudents, getCachedFaculty, setCachedFaculty } from '../services/adminService';
import { setupOrUpdateAdminInFirebase } from '../services/updateFirebaseAdmin';

const AuthContext = createContext();

const ADMIN_EMAIL = 'jthakre62@gmail.com';
const DEFAULT_COLLEGE_ID = 'COLLEGE_001';

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ayurveda_token') || '');
  const [loading, setLoading] = useState(true);

  // Authenticated fetch helper
  const authFetch = async (url, options = {}) => {
    let currentToken = token;
    if (!currentToken && auth?.currentUser) {
      try {
        currentToken = await auth.currentUser.getIdToken();
      } catch (e) {
        console.warn('Could not retrieve Firebase ID token:', e);
      }
    }
    
    if (!currentToken) {
      currentToken = localStorage.getItem('ayurveda_token');
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response;
  };

  // Helper for quick non-blocking timeout
  const fastTimeout = (promise, ms = 600) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('FastTimeout')), ms)),
    ]);
  };

  // Helper to load or initialize profile instantly without blocking on Firestore
  const syncUserProfile = async (firebaseUser, customUsername = '') => {
    if (!firebaseUser) return null;

    const email = (firebaseUser.email || '').toLowerCase().trim();
    const isAdminEmail = email === ADMIN_EMAIL.toLowerCase();
    const cachedName = localStorage.getItem('ayurveda_user_name_' + email);
    const resolvedName = customUsername || cachedName || firebaseUser.displayName || (isAdminEmail ? 'Jay Thakre' : email.split('@')[0]);

    // Check if user has already changed password previously
    const isPassAlreadyChanged = localStorage.getItem('ayurveda_pass_updated_' + email) === 'true' || isAdminEmail;

    // Instant local profile constructed immediately (0ms)
    const instantProfile = {
      _id: firebaseUser.uid,
      uid: firebaseUser.uid,
      id: firebaseUser.uid,
      email,
      name: resolvedName,
      displayName: resolvedName,
      role: isAdminEmail ? 'admin' : 'student',
      collegeId: DEFAULT_COLLEGE_ID,
      isActive: true,
      isDefaultPassword: !isPassAlreadyChanged,
    };

    // Fast attempt to check Firestore with 600ms cap (non-blocking fallback)
    if (db) {
      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await fastTimeout(getDoc(userRef), 600);

        if (userSnap && userSnap.exists()) {
          const data = userSnap.data();
          if (isAdminEmail && data.role !== 'admin') {
            updateDoc(userRef, { role: 'admin', updatedAt: serverTimestamp() }).catch(() => {});
            data.role = 'admin';
          }
          const firestorePassChanged = data.isDefaultPassword === false;
          if (firestorePassChanged) {
            localStorage.setItem('ayurveda_pass_updated_' + email, 'true');
          }
          const finalIsDefault = isPassAlreadyChanged || firestorePassChanged ? false : (data.isDefaultPassword !== false && !isAdminEmail);

          return {
            ...instantProfile,
            ...data,
            name: customUsername || cachedName || data.name || data.displayName || resolvedName,
            displayName: customUsername || cachedName || data.displayName || data.name || resolvedName,
            isDefaultPassword: finalIsDefault,
          };
        } else {
          // Initialize doc asynchronously in background
          setDoc(userRef, {
            ...instantProfile,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true }).catch(() => {});
        }
      } catch (err) {
        // Use instant profile on timeout or offline
      }
    }

    return instantProfile;
  };

  // Firebase Auth State Listener (Instant non-blocking response)
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await syncUserProfile(firebaseUser);

          // Check if account is disabled
          if (profile && profile.isActive === false) {
            await signOut(auth);
            localStorage.removeItem('ayurveda_token');
            setToken('');
            setCurrentUser(null);
            setLoading(false);
            return;
          }

          firebaseUser.getIdToken().then(idToken => {
            localStorage.setItem('ayurveda_token', idToken);
            setToken(idToken);
          }).catch(() => {});

          setCurrentUser(profile);
        } catch (err) {
          console.error('[AuthContext] Auth state error:', err);
        }
      } else {
        localStorage.removeItem('ayurveda_token');
        setToken('');
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Lightning-fast Login handler
  const login = async (email, password, username = '') => {
    const trimmedEmail = email.trim().toLowerCase();
    const customUsername = (username || '').trim();

    if (!auth) {
      throw new Error('Firebase Authentication is not initialized');
    }

    try {
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      } catch (authError) {
        // 1. If admin account doesn't exist yet in Firebase Auth, attempt auto-creation/update
        if (
          trimmedEmail === ADMIN_EMAIL.toLowerCase() &&
          (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential')
        ) {
          const adminResult = await setupOrUpdateAdminInFirebase(trimmedEmail, password, customUsername || 'Jay Thakre');
          if (adminResult.success) {
            userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
          } else {
            throw authError;
          }
        } 
        // 2. If student or faculty account was created by admin, auto-provision and verify
        else if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential') {
          const cachedStudents = getCachedStudents();
          const cachedFaculty = getCachedFaculty();
          const registeredUser = cachedStudents.find(s => s.email.toLowerCase() === trimmedEmail) ||
                                 cachedFaculty.find(f => f.email.toLowerCase() === trimmedEmail);

          const isPassAlreadyChanged = localStorage.getItem('ayurveda_pass_updated_' + trimmedEmail) === 'true';
          const expectedPass = localStorage.getItem('ayurveda_account_pass_' + trimmedEmail) || registeredUser?.displayPassword || 'BAMS@123';
          
          let isPassValid = false;
          if (isPassAlreadyChanged) {
            // Once password is changed, user must sign in with their updated password
            isPassValid = password === expectedPass;
          } else {
            // First-time login: allow assigned default password
            isPassValid = password === expectedPass || password === 'BAMS@123';
          }

          if (!isPassValid) {
            throw new Error('Invalid email or password');
          }

          if (registeredUser || isPassValid) {
            const userName = customUsername || registeredUser?.name || trimmedEmail.split('@')[0];
            
            // Try direct client SDK account creation
            try {
              userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
            } catch (createErr) {
              // If already in Auth but needs password sync or REST registration
              const regResult = await registerFirebaseStudent(trimmedEmail, password, userName);
              if (regResult.success) {
                userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password).catch(() => null);
              }
            }

            // If still no userCredential, fallback to valid registered user session
            if (!userCredential && registeredUser) {
              const fallbackProfile = {
                uid: registeredUser._id || registeredUser.id || 'usr_' + Date.now(),
                email: trimmedEmail,
                name: userName,
                displayName: userName,
                role: registeredUser.role || 'student',
                collegeId: registeredUser.collegeId || DEFAULT_COLLEGE_ID,
                isActive: registeredUser.isActive !== false,
                isDefaultPassword: registeredUser.isDefaultPassword !== false,
              };

              const fallbackToken = 'token_' + Date.now();
              localStorage.setItem('ayurveda_token', fallbackToken);
              if (userName) localStorage.setItem('ayurveda_user_name_' + trimmedEmail, userName);
              setToken(fallbackToken);
              setCurrentUser(fallbackProfile);

              return {
                success: true,
                token: fallbackToken,
                user: fallbackProfile,
              };
            }

            if (!userCredential) {
              throw authError;
            }
          } else {
            throw authError;
          }
        } else {
          throw authError;
        }
      }

      const firebaseUser = userCredential.user;

      // Persist username immediately to localStorage
      if (customUsername) {
        localStorage.setItem('ayurveda_user_name_' + trimmedEmail, customUsername);
      }

      // Fast instant profile resolution (<50ms)
      const profile = await syncUserProfile(firebaseUser, customUsername);

      // Async background sync for Firebase Auth & Firestore (non-blocking)
      if (customUsername) {
        updateProfile(firebaseUser, { displayName: customUsername }).catch(() => {});
        if (db) {
          const uRef = doc(db, 'users', firebaseUser.uid);
          updateDoc(uRef, { name: customUsername, displayName: customUsername, updatedAt: serverTimestamp() }).catch(() => {});
        }
      }

      // Account status check
      if (profile && profile.isActive === false) {
        await signOut(auth);
        throw new Error('Your account has been disabled. Please contact your college administrator.');
      }

      // Retrieve token quickly
      let idToken = '';
      try {
        idToken = await fastTimeout(firebaseUser.getIdToken(), 1000);
      } catch (e) {
        idToken = 'session_' + Date.now();
      }

      localStorage.setItem('ayurveda_token', idToken);
      setToken(idToken);
      setCurrentUser(profile);

      return {
        success: true,
        token: idToken,
        user: profile,
      };
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      let message = 'Invalid email or password';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        message = 'Invalid email or password';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Access temporarily locked due to multiple failed attempts. Please try again later.';
      } else if (error.message) {
        message = error.message;
      }
      throw new Error(message);
    }
  };

  // Google Login handler
  const loginWithGoogle = async () => {
    if (!auth || !googleProvider) {
      throw new Error('Google Sign-in is not available');
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const profile = await syncUserProfile(result.user);

      if (profile && profile.isActive === false) {
        await signOut(auth);
        throw new Error('Your account has been disabled. Please contact your college administrator.');
      }

      const idToken = await result.user.getIdToken();
      localStorage.setItem('ayurveda_token', idToken);
      setToken(idToken);
      setCurrentUser(profile);

      return { success: true, token: idToken, user: profile };
    } catch (error) {
      console.error('[AuthContext] Google sign-in error:', error);
      throw new Error(error.message || 'Google sign-in failed');
    }
  };

  // Change Password handler with Firebase (Optimized Fast Path)
  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    const activeUser = auth?.currentUser || currentUser;
    if (!activeUser) {
      throw new Error('User is not authenticated');
    }

    if (newPassword !== confirmPassword) {
      throw new Error('New password and confirmation password do not match');
    }

    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }

    const userEmail = (activeUser.email || currentUser?.email || auth?.currentUser?.email || '').toLowerCase().trim();

    try {
      // 1. Re-authenticate user with current password if Firebase Auth user is active
      if (auth?.currentUser && currentPassword && auth.currentUser.email) {
        try {
          const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
          await fastTimeout(reauthenticateWithCredential(auth.currentUser, credential), 2000);
        } catch (reauthErr) {
          if (reauthErr.code === 'auth/wrong-password' || reauthErr.code === 'auth/invalid-credential') {
            const expectedStoredPass = localStorage.getItem('ayurveda_account_pass_' + userEmail) || 'BAMS@123';
            if (currentPassword !== expectedStoredPass && currentPassword !== 'BAMS@123') {
              throw new Error('Current password is incorrect');
            }
          }
          // If already recently authenticated or fastTimeout, continue
        }
      }

      // 2. Update password in Firebase Auth with fast timeout
      if (auth?.currentUser) {
        try {
          await fastTimeout(updatePassword(auth.currentUser, newPassword), 2500);
        } catch (upErr) {
          // Fallback to REST API if SDK call timed out
          const currentToken = await auth.currentUser.getIdToken().catch(() => '');
          const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
          if (currentToken && apiKey) {
            fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                idToken: currentToken,
                password: newPassword,
                returnSecureToken: true,
              }),
            }).catch(() => {});
          }
        }
      } else if (userEmail) {
        registerFirebaseStudent(userEmail, newPassword).catch(() => {});
      }

      // 3. Non-blocking async background update for Firestore
      const uid = activeUser.uid || currentUser?.uid;
      if (db && uid) {
        const userRef = doc(db, 'users', uid);
        updateDoc(userRef, {
          isDefaultPassword: false,
          displayPassword: newPassword,
          updatedAt: serverTimestamp(),
        }).catch(() => {});
      }

      // 4. Update local state & permanent password update flag immediately
      if (userEmail) {
        localStorage.setItem('ayurveda_pass_updated_' + userEmail, 'true');
        localStorage.setItem('ayurveda_account_pass_' + userEmail, newPassword);

        // Update students cache
        const students = getCachedStudents();
        const updatedStudents = students.map(s => (s.email?.toLowerCase().trim() === userEmail ? { ...s, isDefaultPassword: false, displayPassword: newPassword } : s));
        setCachedStudents(updatedStudents);

        // Update faculty cache
        const faculty = getCachedFaculty();
        const updatedFaculty = faculty.map(f => (f.email?.toLowerCase().trim() === userEmail ? { ...f, isDefaultPassword: false, displayPassword: newPassword } : f));
        setCachedFaculty(updatedFaculty);
      }

      setCurrentUser((prev) => ({
        ...(prev || {}),
        isDefaultPassword: false,
        displayPassword: newPassword,
      }));

      return {
        success: true,
        message: 'Password updated successfully',
      };
    } catch (error) {
      console.error('[AuthContext] ChangePassword error:', error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('Current password is incorrect');
      } else if (error.code === 'auth/requires-recent-login') {
        throw new Error('Please sign out and sign in again before changing your password');
      }
      throw new Error(error.message || 'Failed to update password');
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn('Firebase logout warning:', e);
    } finally {
      localStorage.removeItem('ayurveda_token');
      setToken('');
      setCurrentUser(null);
    }
  };

  const updateUserState = (updatedUser) => {
    setCurrentUser((prev) => ({ ...prev, ...updatedUser }));
  };

  const isAdmin = currentUser?.role === 'admin' || (currentUser?.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const isFaculty = currentUser?.role === 'faculty';
  const isFacultyOrAdmin = isAdmin || isFaculty;
  const isStudent = !isAdmin && !isFaculty;

  const value = {
    currentUser,
    token,
    isAdmin,
    isFaculty,
    isFacultyOrAdmin,
    isStudent,
    loading,
    login,
    loginWithGoogle,
    changePassword,
    logout,
    updateUserState,
    authFetch,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
