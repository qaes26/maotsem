import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

// Read configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

// Check if Firebase is actually configured
export const isFirebaseConfigured = () => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey.length > 10 &&
    firebaseConfig.projectId
  );
};

// Initialize Firebase App
let app = null;
let auth = null;
let db = null;

try {
  if (isFirebaseConfigured()) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    // Set language to Arabic for SMS verification
    auth.languageCode = 'ar';
    console.log('🔥 [Firebase] Initialized successfully with project:', firebaseConfig.projectId);
  } else {
    console.log('ℹ️ [Firebase] Config keys are not set yet. Running in Demo / Hybrid mode.');
  }
} catch (e) {
  console.warn('[Firebase] Init error (running in fallback mode):', e);
}

export { app, auth, db };

/**
 * Setup invisible reCAPTCHA for phone authentication
 */
export const setupRecaptcha = (containerId = 'recaptcha-container') => {
  if (!auth) return null;
  try {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }

    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        console.log('[Firebase Auth] reCAPTCHA verified successfully');
      },
      'expired-callback': () => {
        console.warn('[Firebase Auth] reCAPTCHA expired, please try again');
      },
    });

    window.recaptchaVerifier = verifier;
    return verifier;
  } catch (err) {
    console.error('[Firebase Auth] RecaptchaVerifier setup error:', err);
    return null;
  }
};

/**
 * Send real SMS OTP to the phone number via Firebase Phone Auth
 */
export const sendFirebaseOtp = async (phoneNumber, appVerifier) => {
  if (!auth) {
    throw new Error('Firebase Auth غير مهيأ. يرجى إضافة المفاتيح في ملف .env');
  }
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    window.confirmationResult = confirmationResult;
    return confirmationResult;
  } catch (err) {
    console.error('[Firebase Auth] Send OTP error:', err);
    throw err;
  }
};

/**
 * Verify OTP code with Firebase
 */
export const verifyFirebaseOtp = async (otpCode, confirmationResult = window.confirmationResult) => {
  if (!confirmationResult) {
    throw new Error('لم يتم العثور على جلسة تحقق نشطة. يرجى إعادة إرسال الرمز.');
  }
  try {
    const result = await confirmationResult.confirm(otpCode);
    const user = result.user;

    // Sync or save to Firestore
    if (db && user) {
      const userDocRef = doc(db, 'users', user.uid);
      const existingDoc = await getDoc(userDocRef);

      if (!existingDoc.exists()) {
        const initialProfile = {
          uid: user.uid,
          phone: user.phoneNumber,
          nickname: `لاعب_${user.phoneNumber ? user.phoneNumber.slice(-4) : 'سري'}`,
          avatar: '🦁',
          points: 0,
          gamesPlayed: 0,
          gamesWon: 0,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, initialProfile);
        return { user, profile: initialProfile };
      } else {
        await updateDoc(userDocRef, {
          lastLoginAt: new Date().toISOString(),
        });
        return { user, profile: existingDoc.data() };
      }
    }

    return { user, profile: null };
  } catch (err) {
    console.error('[Firebase Auth] Verify OTP error:', err);
    throw err;
  }
};

/**
 * Save user profile to Firestore
 */
export const saveUserProfileToFirestore = async (uid, data) => {
  if (!db || !uid) return;
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, data, { merge: true });
  } catch (err) {
    console.error('[Firestore] Save profile error:', err);
  }
};

/**
 * Get user profile from Firestore
 */
export const getUserProfileFromFirestore = async (uid) => {
  if (!db || !uid) return null;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.error('[Firestore] Get profile error:', err);
    return null;
  }
};

