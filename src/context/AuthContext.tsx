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
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setCurrentUser(userDoc.data() as User);
          } else {
            // Fallback if document doesn't exist yet (shouldn't happen in normal flow)
            console.error('User document not found');
            // Don't set null here immediately, as it might be created in the next step of loginWithGoogle
            // But for now, if it's missing, we can't really do much.
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
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async (role: Role = 'freelancer') => {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    
    // Check if user exists
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
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
      
      await setDoc(userDocRef, newUser);
      setCurrentUser(newUser);
    } else {
      setCurrentUser(userDoc.data() as User);
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

    // Create user document in Firestore
    await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
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
