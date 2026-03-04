import {
  ref,
  get,
  set,
  update,
  push,
  remove,
  query,
  orderByChild,
  equalTo,
  onValue,
  off
} from 'firebase/database';
import { db } from '../lib/firebase';
import { User, Startup, Application, Conversation, Message } from '../models/types';

// Generic Helpers
const getCollection = async <T>(collectionName: string) => {
  const collectionRef = ref(db, collectionName);
  const snapshot = await get(collectionRef);
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.keys(data).map(key => ({ id: key, ...data[key] } as T));
  }
  return [];
};

const getById = async <T>(collectionName: string, id: string) => {
  const docRef = ref(db, `${collectionName}/${id}`);
  const snapshot = await get(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.key, ...snapshot.val() } as T;
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
    const userRef = ref(db, `users/${id}`);
    await update(userRef, data);
  },
  getFreelancers: async () => {
    const usersRef = ref(db, 'users');
    const q = query(usersRef, orderByChild('role'), equalTo('freelancer'));
    const snapshot = await get(q);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] } as User));
    }
    return [];
  }
};

// Startup Service
export const startupService = {
  getAll: () => getCollection<Startup>('startups'),
  getById: (id: string) => getById<Startup>('startups', id),
  create: async (data: Omit<Startup, 'id'>) => {
    const startupsRef = ref(db, 'startups');
    const newRef = push(startupsRef);
    await set(newRef, data);
    return { id: newRef.key as string, ...data };
  },
  update: async (id: string, data: Partial<Startup>) => {
    const startupRef = ref(db, `startups/${id}`);
    await update(startupRef, data);
  },
  getByFounderId: async (founderId: string) => {
    const startupsRef = ref(db, 'startups');
    const q = query(startupsRef, orderByChild('founderId'), equalTo(founderId)); // Fixed typo here as well from the original "founderId" query
    const snapshot = await get(q);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] } as Startup));
    }
    return [];
  }
};

// Application Service
export const applicationService = {
  create: async (data: Omit<Application, 'id'>) => {
    const appsRef = ref(db, 'applications');
    const newRef = push(appsRef);
    await set(newRef, data);
    return { id: newRef.key as string, ...data };
  },
  getByStartupId: async (startupId: string) => {
    const appsRef = ref(db, 'applications');
    const q = query(appsRef, orderByChild('startupId'), equalTo(startupId));
    const snapshot = await get(q);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] } as Application));
    }
    return [];
  },
  getByFreelancerId: async (freelancerId: string) => {
    const appsRef = ref(db, 'applications');
    const q = query(appsRef, orderByChild('freelancerId'), equalTo(freelancerId));
    const snapshot = await get(q);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] } as Application));
    }
    return [];
  },
  updateStatus: async (id: string, status: Application['status']) => {
    const appRef = ref(db, `applications/${id}`);
    await update(appRef, { status });
  }
};

// Chat Service
export const chatService = {
  createConversation: async (participants: string[]) => {
    const convsRef = ref(db, 'conversations');
    const snapshot = await get(convsRef);

    let existing;
    if (snapshot.exists()) {
      const data = snapshot.val();
      const docs = Object.keys(data).map(key => ({ id: key, ...data[key] } as Conversation));
      existing = docs.find(doc =>
        doc.participants &&
        doc.participants.includes(participants[0]) &&
        doc.participants.includes(participants[1])
      );
    }

    if (existing) {
      return existing;
    }

    const newConv: Omit<Conversation, 'id'> = {
      participants,
      lastMessage: '',
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newRef = push(convsRef);
    await set(newRef, newConv);
    return { id: newRef.key as string, ...newConv };
  },

  getUserConversations: async (userId: string) => {
    const convsRef = ref(db, 'conversations');
    const snapshot = await get(convsRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      const docs = Object.keys(data).map(key => ({ id: key, ...data[key] } as Conversation));

      return docs
        .filter(doc => doc.participants && doc.participants.includes(userId))
        .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    }
    return [];
  },

  getMessages: async (conversationId: string) => {
    const msgsRef = ref(db, 'messages');
    const q = query(msgsRef, orderByChild('conversationId'), equalTo(conversationId));
    const snapshot = await get(q);

    if (snapshot.exists()) {
      const data = snapshot.val();
      const docs = Object.keys(data).map(key => ({ id: key, ...data[key] } as Message));
      return docs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return [];
  },

  sendMessage: async (data: Omit<Message, 'id'>) => {
    const message = {
      ...data,
      read: false
    };

    const msgsRef = ref(db, 'messages');
    const newRef = push(msgsRef);
    await set(newRef, message);

    // Update conversation
    const convRef = ref(db, `conversations/${data.conversationId}`);
    await update(convRef, {
      lastMessage: data.content,
      lastMessageAt: data.createdAt,
      updatedAt: data.createdAt
    });

    return { id: newRef.key as string, ...message };
  },

  subscribeToConversations: (userId: string, callback: (convs: Conversation[]) => void) => {
    const convsRef = ref(db, 'conversations');

    const listener = onValue(convsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const docs = Object.keys(data).map(key => ({ id: key, ...data[key] } as Conversation));

        const userConvs = docs
          .filter(doc => doc.participants && doc.participants.includes(userId))
          .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

        callback(userConvs);
      } else {
        callback([]);
      }
    });

    return () => off(convsRef, 'value', listener);
  },

  subscribeToMessages: (conversationId: string, callback: (msgs: Message[]) => void) => {
    const msgsRef = ref(db, 'messages');
    const q = query(msgsRef, orderByChild('conversationId'), equalTo(conversationId));

    const listener = onValue(q, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const docs = Object.keys(data).map(key => ({ id: key, ...data[key] } as Message));
        const sortedMsgs = docs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        callback(sortedMsgs);
      } else {
        callback([]);
      }
    });

    return () => off(q, 'value', listener);
  },

  createOffer: async (data: any) => {
    const offersRef = ref(db, 'offers');
    const newRef = push(offersRef);
    await set(newRef, data);
    return { id: newRef.key as string, ...data };
  },

  getOfferById: async (id: string) => {
    return getById<any>('offers', id);
  },

  updateOfferStatus: async (id: string, status: any) => {
    const offerRef = ref(db, `offers/${id}`);
    await update(offerRef, { status });
  }
};
