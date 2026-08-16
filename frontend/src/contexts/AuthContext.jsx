import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from '../services/firebase';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(!!auth); // true only when Firebase auth exists
  const [isFirebaseEnabled] = useState(!!auth);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    if (isFirebaseEnabled && auth) {
      return signInWithPopup(auth, googleProvider);
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
