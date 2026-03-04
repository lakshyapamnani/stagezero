import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { ref, get, set, child } from 'firebase/database';
import { auth, db, googleProvider } from '../lib/firebase';
import { User, Role } from '../models/types';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (role?: Role) => Promise<void>;
  register: (email: string, password: string, name: string, role: Role) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch user profile from RTDB
          const userRef = ref(db, `users/${firebaseUser.uid}`);
          const userSnap = await get(userRef);
          if (userSnap.exists()) {
            setCurrentUser(userSnap.val() as User);
          } else {
            // During registration, the auth state changes BEFORE the user document is created.
            // We just wait for the subsequent sign-in or manual state update by the `register` function.
            // Returning early prevents the console error and null set.
            return;
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Wait to fetch the user profile from RTDB so we can properly redirect
    const userRef = ref(db, `users/${firebaseUser.uid}`);
    const userSnap = await get(userRef);

    if (userSnap.exists()) {
      setCurrentUser(userSnap.val() as User);
    } else {
      // In the rare case that auth succeeded but user document is missing,
      // create a minimal fallback to avoid hanging the UI or redirect loops.
      setCurrentUser({
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        role: 'freelancer', // Default fallback
        bio: '',
        skills: [],
        availability: '',
        createdAt: new Date().toISOString(),
      });
    }
  };

  const loginWithGoogle = async (role: Role = 'freelancer') => {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    // Check if user exists
    const userRef = ref(db, `users/${firebaseUser.uid}`);
    const userSnap = await get(userRef);

    if (!userSnap.exists()) {
      // Create new user if not exists
      const newUser: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        role: role,
        bio: '',
        skills: [],
        availability: '',
        avatar: firebaseUser.photoURL || undefined,
        createdAt: new Date().toISOString(),
      };

      await set(userRef, newUser);
      setCurrentUser(newUser);
    } else {
      setCurrentUser(userSnap.val() as User);
    }
  };

  const register = async (email: string, password: string, name: string, role: Role) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    await updateProfile(firebaseUser, { displayName: name });

    const newUser: User = {
      id: firebaseUser.uid,
      name,
      email,
      role,
      bio: '',
      skills: [],
      availability: '',
      createdAt: new Date().toISOString(),
    };

    // Create user document in RTDB
    await set(ref(db, `users/${firebaseUser.uid}`), newUser);
    setCurrentUser(newUser);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: !!currentUser,
      isLoading,
      login,
      loginWithGoogle,
      register,
      logout
    }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
