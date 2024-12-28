'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../utils/firebase';
import type { UserData } from '../utils/firebase';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';

interface UserContextType {
  user: User | null;
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  userData: null,
  setUserData: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    // Set persistence to local
    setPersistence(auth, browserLocalPersistence);

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      // Clear userData if user is null (signed out)
      if (!user) {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
} 