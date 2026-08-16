import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from '../services/firebase';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(!!auth); // true only when Firebase auth exists
  const [isFirebaseEnabled] = useState(!!auth);

  useEffect(() => {
    if (!auth) return;

    // Capture the redirect sign-in result when returning to the app (for mobile)
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log("Successfully logged in via redirect:", result.user);
        }
      })
      .catch((error) => {
        console.error("Google Redirect Auth Error:", error);
      });

    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    if (isFirebaseEnabled && auth) {
      // Use redirect on mobile browsers (popup gets blocked), popup on desktop
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        return signInWithRedirect(auth, googleProvider);
      } else {
        return signInWithPopup(auth, googleProvider);
      }
    } else {
      setCurrentUser({ uid: 'mock-123', email: 'scholar@ayurveda.lab', displayName: 'Mock Scholar' });
      return Promise.resolve();
    }
  };

  const loginWithEmail = (email, password) => {
    if (isFirebaseEnabled && auth) {
      return signInWithEmailAndPassword(auth, email, password);
    } else {
      setCurrentUser({ uid: 'mock-123', email, displayName: email.split('@')[0] });
      return Promise.resolve();
    }
  };

  const signupWithEmail = (email, password) => {
    if (isFirebaseEnabled && auth) {
      return createUserWithEmailAndPassword(auth, email, password);
    } else {
      setCurrentUser({ uid: 'mock-123', email, displayName: email.split('@')[0] });
      return Promise.resolve();
    }
  };

  const logout = () => {
    if (isFirebaseEnabled && auth) {
      return signOut(auth);
    } else {
      setCurrentUser(null);
      return Promise.resolve();
    }
  };

  const adminEmails = [
    'admin@ayurveda.lab',
    'jayy1506@gmail.com',
    'bharatrathi174@gmail.com',
    'rvr.226@gmail.com',
    'jthakre62@gmail.com',
    import.meta.env.VITE_ADMIN_EMAIL
  ].filter(Boolean);

  const isAdmin = currentUser && (
    adminEmails.includes(currentUser.email) ||
    currentUser.email?.toLowerCase().startsWith('admin@')
  );

  const value = {
    currentUser,
    isAdmin,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    logout,
    isFirebaseEnabled
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
