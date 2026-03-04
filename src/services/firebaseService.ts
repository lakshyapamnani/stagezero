import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, Startup, Application, Conversation, Message } from '../models/types';

// Generic Helpers
const getCollection = async <T>(collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
};

const getById = async <T>(collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }
  return null;
};

// Cloudinary Service
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'stagezero_unsigned'; // Fallback or env
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo'; // Fallback or env

export const cloudinaryService = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await response.json();
      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }
};

// User Service
export const userService = {
  getAll: () => getCollection<User>('users'),
  getById: (id: string) => getById<User>('users', id),
  update: async (id: string, data: Partial<User>) => {
    const userRef = doc(db, 'users', id);
    await updateDoc(userRef, data);
  },
  getFreelancers: async () => {
    const q = query(collection(db, 'users'), where('role', '==', 'freelancer'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  }
};

// Startup Service
export const startupService = {
  getAll: () => getCollection<Startup>('startups'),
  getById: (id: string) => getById<Startup>('startups', id),
  create: async (data: Omit<Startup, 'id'>) => {
    const docRef = await addDoc(collection(db, 'startups'), data);
    return { id: docRef.id, ...data };
  },
  update: async (id: string, data: Partial<Startup>) => {
    const docRef = doc(db, 'startups', id);
    await updateDoc(docRef, data);
  },
  getByFounderId: async (founderId: string) => {
    const q = query(collection(db, 'startups'), where('founderId', '==', 'founderId'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Startup));
  }
};

// Application Service
export const applicationService = {
  create: async (data: Omit<Application, 'id'>) => {
    const docRef = await addDoc(collection(db, 'applications'), data);
    return { id: docRef.id, ...data };
  },
  getByStartupId: async (startupId: string) => {
    const q = query(collection(db, 'applications'), where('startupId', '==', startupId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
  },
  getByFreelancerId: async (freelancerId: string) => {
    const q = query(collection(db, 'applications'), where('freelancerId', '==', freelancerId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
  },
  updateStatus: async (id: string, status: Application['status']) => {
    const docRef = doc(db, 'applications', id);
    await updateDoc(docRef, { status });
  }
};

// Chat Service
export const chatService = {
  createConversation: async (participants: string[]) => {
    // Check if conversation exists
    const q = query(
      collection(db, 'conversations'), 
      where('participants', 'array-contains', participants[0])
    );
    const querySnapshot = await getDocs(q);
    const existing = querySnapshot.docs.find(doc => {
      const data = doc.data() as Conversation;
      return data.participants.includes(participants[1]);
    });

    if (existing) {
      return { id: existing.id, ...existing.data() } as Conversation;
    }

    const newConv: Omit<Conversation, 'id'> = {
      participants,
      lastMessage: '',
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'conversations'), newConv);
    return { id: docRef.id, ...newConv };
  },
  
  getUserConversations: async (userId: string) => {
    const q = query(
      collection(db, 'conversations'), 
      where('participants', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
  },

  getMessages: async (conversationId: string) => {
    const q = query(
      collection(db, 'messages'), 
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
  },

  sendMessage: async (data: Omit<Message, 'id'>) => {
    const message = {
      ...data,
      read: false
    };
    const docRef = await addDoc(collection(db, 'messages'), message);
    
    // Update conversation
    const convRef = doc(db, 'conversations', data.conversationId);
    await updateDoc(convRef, {
      lastMessage: data.content,
      lastMessageAt: data.createdAt,
      updatedAt: data.createdAt
    });

    return { id: docRef.id, ...message };
  },

  subscribeToConversations: (userId: string, callback: (convs: Conversation[]) => void) => {
    const q = query(
      collection(db, 'conversations'), 
      where('participants', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
      callback(convs);
    });
  },

  subscribeToMessages: (conversationId: string, callback: (msgs: Message[]) => void) => {
    const q = query(
      collection(db, 'messages'), 
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      callback(msgs);
    });
  },

  createOffer: async (data: Omit<Offer, 'id'>) => {
    const docRef = await addDoc(collection(db, 'offers'), data);
    return { id: docRef.id, ...data };
  },

  getOfferById: async (id: string) => {
    return getById<Offer>('offers', id);
  },

  updateOfferStatus: async (id: string, status: Offer['status']) => {
    const docRef = doc(db, 'offers', id);
    await updateDoc(docRef, { status });
  }
};
