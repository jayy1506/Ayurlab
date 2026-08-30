import { 
  db, 
  auth,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  addDoc
} from './firebase';

const DEFAULT_ADMIN_EMAIL = 'jthakre62@gmail.com';
const DEFAULT_COLLEGE_ID = 'COLLEGE_001';
const DEFAULT_STUDENT_PASSWORD = 'BAMS@123';
const CACHE_KEY = 'ayurveda_students_cache';
const FACULTY_CACHE_KEY = 'ayurveda_faculty_cache';
const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

// Helper for timeout
const withTimeout = (promise, ms = 1500) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms)),
  ]);
};

// Generic authenticated API fetch helper to synchronize with backend MongoDB
const apiFetch = async (path, options = {}) => {
  try {
    const token = localStorage.getItem('ayurveda_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(path, {
      ...options,
      headers,
      credentials: 'include',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Graceful offline fallback
  }
  return null;
};

// Local storage cache helpers for students
export const getCachedStudents = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    let list = raw ? JSON.parse(raw) : [];
    if (!list || list.length === 0) {
      list = [
        {
          _id: 'std_jay_thakre',
          id: 'std_jay_thakre',
          name: 'Jay Thakre',
          email: 'jaythakre128@gmail.com',
          studentId: 'STU_001',
          role: 'student',
          collegeId: DEFAULT_COLLEGE_ID,
          isActive: true,
          isDefaultPassword: false,
          displayPassword: 'FEAT@123',
          createdAt: '2026-08-26T10:00:00.000Z',
          updatedAt: '2026-08-26T10:00:00.000Z',
        }
      ];
      localStorage.setItem(CACHE_KEY, JSON.stringify(list));
      localStorage.setItem('ayurveda_user_name_jaythakre128@gmail.com', 'Jay Thakre');
      localStorage.setItem('ayurveda_pass_updated_jaythakre128@gmail.com', 'true');
      localStorage.setItem('ayurveda_account_pass_jaythakre128@gmail.com', 'FEAT@123');
    }
    return list;
  } catch (e) {
    return [];
  }
};

export const setCachedStudents = (students) => {
  try {
    if (students && Array.isArray(students)) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(students));
      students.forEach(s => {
        if (s.email) {
          const emailKey = s.email.toLowerCase().trim();
          if (s.name) localStorage.setItem('ayurveda_user_name_' + emailKey, s.name);
          if (s.displayPassword) localStorage.setItem('ayurveda_account_pass_' + emailKey, s.displayPassword);
          if (s.isDefaultPassword === false) localStorage.setItem('ayurveda_pass_updated_' + emailKey, 'true');
        }
      });
    }
  } catch (e) {
    // Ignore storage quota
  }
};

// Local storage cache helpers for faculty (Seeded with persistent default faculty)
export const getCachedFaculty = () => {
  try {
    const raw = localStorage.getItem(FACULTY_CACHE_KEY);
    let list = raw ? JSON.parse(raw) : [];
    if (!list || list.length === 0) {
      list = [
        {
          _id: 'fac_head_rasashastra',
          id: 'fac_head_rasashastra',
          name: 'Dr. V. K. Sharma',
          email: 'faculty@college.edu',
          facultyId: 'FAC_001',
          role: 'faculty',
          collegeId: DEFAULT_COLLEGE_ID,
          isActive: true,
          isDefaultPassword: false,
          displayPassword: 'Faculty@123',
          createdAt: '2026-08-26T10:00:00.000Z',
          updatedAt: '2026-08-26T10:00:00.000Z',
        }
      ];
      localStorage.setItem(FACULTY_CACHE_KEY, JSON.stringify(list));
      localStorage.setItem('ayurveda_user_name_faculty@college.edu', 'Dr. V. K. Sharma');
      localStorage.setItem('ayurveda_account_pass_faculty@college.edu', 'Faculty@123');
      localStorage.setItem('ayurveda_pass_updated_faculty@college.edu', 'true');
    }
    return list;
  } catch (e) {
    return [];
  }
};

export const setCachedFaculty = (faculty) => {
  try {
    if (faculty && Array.isArray(faculty)) {
      localStorage.setItem(FACULTY_CACHE_KEY, JSON.stringify(faculty));
      faculty.forEach(f => {
        if (f.email) {
          const emailKey = f.email.toLowerCase().trim();
          if (f.name) localStorage.setItem('ayurveda_user_name_' + emailKey, f.name);
          if (f.displayPassword) localStorage.setItem('ayurveda_account_pass_' + emailKey, f.displayPassword);
          if (f.isDefaultPassword === false) localStorage.setItem('ayurveda_pass_updated_' + emailKey, 'true');
        }
      });
    }
  } catch (e) {
    // Ignore storage quota
  }
};

/**
 * Register student in Firebase Authentication via REST API (does not log out current admin)
 */
export const registerFirebaseStudent = async (email, password = DEFAULT_STUDENT_PASSWORD, displayName = '') => {
  if (!API_KEY) return { success: false };

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          returnSecureToken: true,
        }),
      }
    );

    const data = await res.json();
    if (res.ok) {
      // Update display name if provided
      if (displayName && data.idToken) {
        fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken: data.idToken,
            displayName,
            returnSecureToken: true,
          }),
        }).catch(() => {});
      }
      return { success: true, uid: data.localId, email: data.email };
    } else if (data.error?.message?.includes('EMAIL_EXISTS')) {
      return { success: true, alreadyExists: true };
    }
    return { success: false, error: data.error?.message };
  } catch (err) {
    console.warn('[AdminService] Student Auth REST registration warning:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Ensure the admin profile is updated/created in Firestore
 */
export const ensureAdminAccount = async (firebaseUser, customName = 'Jay Thakre') => {
  if (!db || !firebaseUser) return null;

  try {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await withTimeout(getDoc(userRef), 2000).catch(() => null);

    const isAdminEmail = (firebaseUser.email || '').toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase();
    
    const adminData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email.toLowerCase(),
      name: firebaseUser.displayName || customName || 'College Administrator',
      role: isAdminEmail ? 'admin' : (userSnap?.exists?.() ? userSnap.data().role : 'student'),
      collegeId: userSnap?.exists?.() ? (userSnap.data().collegeId || DEFAULT_COLLEGE_ID) : DEFAULT_COLLEGE_ID,
      isActive: true,
      isDefaultPassword: false,
      updatedAt: serverTimestamp(),
    };

    if (!userSnap || !userSnap.exists()) {
      adminData.createdAt = serverTimestamp();
      setDoc(userRef, adminData).catch(() => {});
    } else if (isAdminEmail && userSnap.data().role !== 'admin') {
      updateDoc(userRef, { role: 'admin', updatedAt: serverTimestamp() }).catch(() => {});
    }

    return { ...(userSnap?.data?.() || {}), ...adminData, _id: firebaseUser.uid };
  } catch (error) {
    console.warn('[AdminService] Admin setup fast path:', error.message);
    return null;
  }
};

/**
 * Fetch all students for the admin dashboard (Robust Merge + Never Wipe Local Records)
 */
export const getStudentsList = async (collegeId = DEFAULT_COLLEGE_ID) => {
  const cached = getCachedStudents();

  // Background fetch to sync from Firestore if available
  const fetchPromise = (async () => {
    if (!db) return cached;
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'student'));
      const querySnapshot = await withTimeout(getDocs(q), 2200).catch(() => null);

      if (querySnapshot && !querySnapshot.empty) {
        const remoteStudents = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          remoteStudents.push({
            _id: docSnap.id,
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
          });
        });

        // Merge without losing any locally created student
        const studentMap = new Map();
        remoteStudents.forEach(s => {
          if (s.email) studentMap.set(s.email.toLowerCase().trim(), s);
        });
        cached.forEach(s => {
          if (s.email) {
            const key = s.email.toLowerCase().trim();
            const remote = studentMap.get(key);
            studentMap.set(key, { ...(remote || {}), ...s });
          }
        });

        const merged = Array.from(studentMap.values());
        setCachedStudents(merged);
        return merged;
      }
    } catch (e) {
      // Keep cached on error
    }
    return cached;
  })();

  const students = (cached && cached.length > 0) ? cached : await fetchPromise;
  const filtered = collegeId ? (students || []).filter(s => (s.collegeId || DEFAULT_COLLEGE_ID) === collegeId) : (students || []);

  const totalStudents = filtered.length;
  const activeStudents = filtered.filter((s) => s.isActive !== false).length;
  const disabledStudents = totalStudents - activeStudents;

  return {
    students: filtered,
    stats: {
      totalStudents,
      activeStudents,
      disabledStudents,
    }
  };
};

/**
 * Create a new student account (Instant Permanent Persistence + Firestore & Auth Sync)
 */
export const addStudentAccount = async ({ name, email, studentId = '', collegeId = DEFAULT_COLLEGE_ID }) => {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();
  const studentDocId = 'std_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

  const cached = getCachedStudents();
  const existing = cached.find(s => s.email.toLowerCase() === trimmedEmail);
  if (existing) {
    throw new Error('A student with this email address already exists');
  }

  const newStudentData = {
    _id: studentDocId,
    id: studentDocId,
    name: trimmedName,
    email: trimmedEmail,
    studentId: studentId.trim() || `STU_${Math.floor(100 + Math.random() * 900)}`,
    role: 'student',
    collegeId,
    isActive: true,
    isDefaultPassword: true,
    displayPassword: DEFAULT_STUDENT_PASSWORD,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Immediately save into permanent cache and local registry
  const updatedCache = [newStudentData, ...cached];
  setCachedStudents(updatedCache);

  localStorage.setItem('ayurveda_user_name_' + trimmedEmail, trimmedName);
  localStorage.setItem('ayurveda_account_pass_' + trimmedEmail, DEFAULT_STUDENT_PASSWORD);

  // 2. Pre-create in Firebase Authentication in background
  registerFirebaseStudent(trimmedEmail, DEFAULT_STUDENT_PASSWORD, trimmedName).catch(() => {});

  // 3. Persist to Firestore with explicit document ID
  if (db) {
    (async () => {
      try {
        const userRef = doc(db, 'users', studentDocId);
        await withTimeout(setDoc(userRef, {
          ...newStudentData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }), 3000);
      } catch (err) {
        console.warn('[AdminService] Firestore async sync note:', err.message);
      }
    })();
  }

  return newStudentData;
};

/**
 * Toggle active status of a student
 */
export const toggleStudentStatus = async (studentId, isActive) => {
  const cached = getCachedStudents();
  const updated = cached.map(s => (s._id === studentId || s.id === studentId ? { ...s, isActive } : s));
  setCachedStudents(updated);

  if (db) {
    (async () => {
      try {
        const userRef = doc(db, 'users', studentId);
        await updateDoc(userRef, { isActive, updatedAt: serverTimestamp() });
      } catch (e) {}
    })();
  }

  return { success: true, isActive };
};

/**
 * Reset student's password state to default
 */
export const resetStudentPass = async (studentId) => {
  const cached = getCachedStudents();
  const student = cached.find(s => s._id === studentId || s.id === studentId);
  if (student && student.email) {
    const emailKey = student.email.toLowerCase().trim();
    localStorage.removeItem('ayurveda_pass_updated_' + emailKey);
    localStorage.setItem('ayurveda_account_pass_' + emailKey, DEFAULT_STUDENT_PASSWORD);
  }

  const updated = cached.map(s => (s._id === studentId || s.id === studentId ? { ...s, isDefaultPassword: true, displayPassword: DEFAULT_STUDENT_PASSWORD } : s));
  setCachedStudents(updated);

  if (db) {
    (async () => {
      try {
        const userRef = doc(db, 'users', studentId);
        await updateDoc(userRef, { isDefaultPassword: true, displayPassword: DEFAULT_STUDENT_PASSWORD, updatedAt: serverTimestamp() });
      } catch (e) {}
    })();
  }

  return { success: true, isDefaultPassword: true };
};

/**
 * Delete a student record permanently
 */
export const deleteStudentAccount = async (studentId) => {
  const cached = getCachedStudents();
  const student = cached.find(s => s._id === studentId || s.id === studentId);
  if (student && student.email) {
    const emailKey = student.email.toLowerCase().trim();
    localStorage.removeItem('ayurveda_user_name_' + emailKey);
    localStorage.removeItem('ayurveda_account_pass_' + emailKey);
    localStorage.removeItem('ayurveda_pass_updated_' + emailKey);
  }

  const updated = cached.filter(s => s._id !== studentId && s.id !== studentId);
  setCachedStudents(updated);

  if (db) {
    (async () => {
      try {
        const userRef = doc(db, 'users', studentId);
        await deleteDoc(userRef);
      } catch (e) {}
    })();
  }

  return { success: true };
};

/**
 * Fetch all Faculty accounts with persistent merge (Backend API + Firestore + Local Cache)
 */
export const getFacultyList = async (collegeId = DEFAULT_COLLEGE_ID) => {
  const cached = getCachedFaculty();

  const fetchPromise = (async () => {
    let remoteFaculty = [];

    // 1. Try Backend MongoDB API first (/api/admin/faculty)
    try {
      const apiRes = await withTimeout(apiFetch('/api/admin/faculty'), 1500).catch(() => null);
      if (apiRes && apiRes.success && Array.isArray(apiRes.faculty) && apiRes.faculty.length > 0) {
        remoteFaculty = apiRes.faculty.map(f => ({
          _id: f._id || f.id,
          id: f._id || f.id,
          ...f,
          createdAt: f.createdAt || new Date().toISOString(),
        }));
      }
    } catch (e) {}

    // 2. Try Firestore if available and MongoDB empty
    if (remoteFaculty.length === 0 && db) {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'faculty'));
        const snap = await withTimeout(getDocs(q), 2200).catch(() => null);

        if (snap && !snap.empty) {
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            remoteFaculty.push({
              _id: docSnap.id,
              id: docSnap.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
            });
          });
        }
      } catch (e) {}
    }

    // 3. Merge without losing any local records
    const facultyMap = new Map();
    remoteFaculty.forEach(f => {
      if (f.email) facultyMap.set(f.email.toLowerCase().trim(), f);
    });
    cached.forEach(f => {
      if (f.email) {
        const key = f.email.toLowerCase().trim();
        const remote = facultyMap.get(key);
        facultyMap.set(key, { ...(remote || {}), ...f });
      }
    });

    const merged = Array.from(facultyMap.values());
    if (merged.length > 0) {
      setCachedFaculty(merged);
      return merged;
    }
    return cached;
  })();

  const faculty = (cached && cached.length > 0) ? cached : await fetchPromise;
  const filtered = collegeId ? (faculty || []).filter(f => (f.collegeId || DEFAULT_COLLEGE_ID) === collegeId) : (faculty || []);

  const totalFaculty = filtered.length;
  const activeFaculty = filtered.filter((f) => f.isActive !== false).length;
  const disabledFaculty = totalFaculty - activeFaculty;

  return {
    faculty: filtered,
    stats: {
      totalFaculty,
      activeFaculty,
      disabledFaculty,
    }
  };
};

/**
 * Add a new Faculty account (Permanent Persistence: Backend + Firestore + Local)
 */
export const addFacultyAccount = async ({ name, email, facultyId = '', collegeId = DEFAULT_COLLEGE_ID }) => {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();
  const facultyDocId = 'fac_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

  const cached = getCachedFaculty();
  const existing = cached.find(f => f.email.toLowerCase() === trimmedEmail);
  if (existing) {
    throw new Error('A faculty member with this email address already exists');
  }

  const assignedFacultyId = facultyId.trim() || `FAC_${Math.floor(100 + Math.random() * 900)}`;

  const newFacultyData = {
    _id: facultyDocId,
    id: facultyDocId,
    name: trimmedName,
    email: trimmedEmail,
    facultyId: assignedFacultyId,
    role: 'faculty',
    collegeId,
    isActive: true,
    isDefaultPassword: true,
    displayPassword: DEFAULT_STUDENT_PASSWORD,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Immediately cache for instant UI availability
  const updatedCache = [newFacultyData, ...cached];
  setCachedFaculty(updatedCache);

  localStorage.setItem('ayurveda_user_name_' + trimmedEmail, trimmedName);
  localStorage.setItem('ayurveda_account_pass_' + trimmedEmail, DEFAULT_STUDENT_PASSWORD);

  // 2. Pre-create in Firebase Auth in background
  registerFirebaseStudent(trimmedEmail, DEFAULT_STUDENT_PASSWORD, trimmedName).catch(() => {});

  // 3. Persist to Backend MongoDB API
  apiFetch('/api/admin/faculty', {
    method: 'POST',
    body: JSON.stringify({
      name: trimmedName,
      email: trimmedEmail,
      facultyId: assignedFacultyId,
    }),
  }).catch(() => {});

  // 4. Persist to Firestore in background
  if (db) {
    (async () => {
      try {
        const userRef = doc(db, 'users', facultyDocId);
        await withTimeout(setDoc(userRef, {
          ...newFacultyData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }), 3000);
      } catch (err) {
        console.warn('[AdminService] Firestore faculty sync note:', err.message);
      }
    })();
  }

  return newFacultyData;
};

/**
 * Update user role (e.g. promote Student to Faculty or demote)
 */
export const updateUserRole = async (userId, userEmail, newRole) => {
  // Update students cache
  const cachedStudents = getCachedStudents();
  const student = cachedStudents.find(s => s._id === userId || s.id === userId || s.email === userEmail);
  if (student && newRole === 'faculty') {
    setCachedStudents(cachedStudents.filter(s => s._id !== userId && s.id !== userId));
    const cachedFaculty = getCachedFaculty();
    setCachedFaculty([{ ...student, role: 'faculty' }, ...cachedFaculty]);
  }

  // Update faculty cache
  const cachedFaculty = getCachedFaculty();
  const faculty = cachedFaculty.find(f => f._id === userId || f.id === userId || f.email === userEmail);
  if (faculty && newRole === 'student') {
    setCachedFaculty(cachedFaculty.filter(f => f._id !== userId && f.id !== userId));
    const students = getCachedStudents();
    setCachedStudents([{ ...faculty, role: 'student' }, ...students]);
  }

  // Update Firestore
  if (db) {
    (async () => {
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { role: newRole, updatedAt: serverTimestamp() });
      } catch (e) {}
    })();
  }

  return { success: true, role: newRole };
};

/**
 * Toggle active status of a faculty member
 */
export const toggleFacultyStatus = async (facultyId, isActive) => {
  const cached = getCachedFaculty();
  const updated = cached.map(f => (f._id === facultyId || f.id === facultyId ? { ...f, isActive } : f));
  setCachedFaculty(updated);

  // Update backend MongoDB
  apiFetch(`/api/admin/faculty/${facultyId}/${isActive ? 'enable' : 'disable'}`, { method: 'PATCH' }).catch(() => {});

  if (db) {
    (async () => {
      try {
        const userRef = doc(db, 'users', facultyId);
        await updateDoc(userRef, { isActive, updatedAt: serverTimestamp() });
      } catch (e) {}
    })();
  }

  return { success: true, isActive };
};

/**
 * Reset faculty password state to default
 */
export const resetFacultyPass = async (facultyId) => {
  const cached = getCachedFaculty();
  const faculty = cached.find(f => f._id === facultyId || f.id === facultyId);
  if (faculty && faculty.email) {
    localStorage.removeItem('ayurveda_pass_updated_' + faculty.email.toLowerCase());
    localStorage.removeItem('ayurveda_account_pass_' + faculty.email.toLowerCase());
  }

  const updated = cached.map(f => (f._id === facultyId || f.id === facultyId ? { ...f, isDefaultPassword: true, displayPassword: DEFAULT_STUDENT_PASSWORD } : f));
  setCachedFaculty(updated);

  // Reset in backend MongoDB
  apiFetch(`/api/admin/faculty/${facultyId}/reset-password`, { method: 'POST' }).catch(() => {});

  if (db) {
    (async () => {
      try {
        const userRef = doc(db, 'users', facultyId);
        await updateDoc(userRef, { isDefaultPassword: true, displayPassword: DEFAULT_STUDENT_PASSWORD, updatedAt: serverTimestamp() });
      } catch (e) {}
    })();
  }

  return { success: true, isDefaultPassword: true };
};

/**
 * Delete a faculty record permanently
 */
export const deleteFacultyAccount = async (facultyId) => {
  const cached = getCachedFaculty();
  const updated = cached.filter(f => f._id !== facultyId && f.id !== facultyId);
  setCachedFaculty(updated);

  // Delete from backend MongoDB
  apiFetch(`/api/admin/faculty/${facultyId}`, { method: 'DELETE' }).catch(() => {});

  if (db) {
    (async () => {
      try {
        const userRef = doc(db, 'users', facultyId);
        await deleteDoc(userRef);
      } catch (e) {}
    })();
  }

  return { success: true };
};
