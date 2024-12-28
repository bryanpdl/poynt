import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export const auth = getAuth();
export const db = getFirestore();
export const googleProvider = new GoogleAuthProvider();

export interface UserData {
  email: string;
  displayName: string;
  username: string;
  dateCreated: Date;
  lastLogin: Date;
  wallet: number;
  stats: {
    highestScore: number;
    highestMultiplier: number;
    totalGamesPlayed: number;
    totalWinnings: number;
  };
}

export const createUserDocument = async (user: User): Promise<UserData> => {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    const userData: UserData = {
      email: user.email || '',
      displayName: user.displayName || '',
      username: '', // Initially empty, to be set later
      dateCreated: new Date(),
      lastLogin: new Date(),
      wallet: 1000, // Starting balance
      stats: {
        highestScore: 0,
        highestMultiplier: 0,
        totalGamesPlayed: 0,
        totalWinnings: 0
      }
    };

    await setDoc(userRef, {
      ...userData,
      dateCreated: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
    return userData;
  }

  // Update last login
  await updateDoc(userRef, {
    lastLogin: serverTimestamp(),
  });

  return userDoc.data() as UserData;
};

export const updateUsername = async (userId: string, username: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { username });
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const userData = await createUserDocument(result.user);
    // Return whether this is a new user (no username set)
    return { 
      user: result.user, 
      userData,
      isNewUser: !userData.username 
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const updateUserStats = async (
  userId: string,
  score: number,
  multiplier: number,
  winAmount: number,
  isLoss: boolean = false
) => {
  const userRef = doc(db, 'users', userId);
  
  // Get current stats
  const userDoc = await getDoc(userRef);
  const currentStats = userDoc.data()?.stats || {
    totalGamesPlayed: 0,
    highestScore: 0,
    highestMultiplier: 0,
    biggestWin: 0,
    totalWinnings: 0
  };

  // Ensure winAmount is a valid number
  const validWinAmount = isNaN(winAmount) ? 0 : winAmount;
  const validCurrentTotal = isNaN(currentStats.totalWinnings) ? 0 : currentStats.totalWinnings;

  // Update stats
  const newStats = {
    totalGamesPlayed: currentStats.totalGamesPlayed + 1,
    highestScore: Math.max(currentStats.highestScore, score),
    highestMultiplier: Math.max(currentStats.highestMultiplier, multiplier),
    biggestWin: Math.max(currentStats.biggestWin, validWinAmount),
    totalWinnings: validCurrentTotal + validWinAmount
  };

  // Update the document
  await updateDoc(userRef, {
    stats: newStats
  });
};

export const updateUserWallet = async (userId: string, newBalance: number) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    wallet: newBalance
  });
}; 