export type Role = 'founder' | 'freelancer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  bio: string;
  skills: string[];
  availability: string;
  createdAt: string;
}

export type StartupStage = 'Idea' | 'MVP' | 'Revenue';
export type CompensationType = 'paid' | 'equity' | 'hybrid';

export interface RoleDetails {
  title: string;
  type: string; // Full-time, Contract
  location: string; // Remote, Hybrid
  salaryRange: string;
  equityRange: string;
  responsibilities: string[];
  expiresInDays: number;
}

export interface Startup {
  id: string;
  founderId: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  stage: StartupStage;
  techStack: string[];
  compensationType: CompensationType;
  duration: string;
  teamSize: string;
  location: string;
  funding: string;
  problem: string;
  vision: string;
  openRoles: RoleDetails[];
  createdAt: string;
}

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

export interface Application {
  id: string;
  startupId: string;
  freelancerId: string;
  status: ApplicationStatus;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[]; // User IDs
  createdAt: string;
  updatedAt: string;
}

export type MessageType = 'text' | 'offer';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  content: string; // If type is offer, this might be JSON string or just text reference
  offerId?: string; // Optional reference if type is offer
  createdAt: string;
}

export type OfferStatus = 'pending' | 'accepted' | 'declined';

export interface Offer {
  id: string;
  conversationId: string;
  founderId: string;
  freelancerId: string;
  roleTitle: string;
  offerType: CompensationType;
  paymentAmount: string; // e.g. "$5000/mo" or "$50/hr"
  equityPercent: string; // e.g. "1.5%"
  duration: string;
  startDate: string;
  status: OfferStatus;
  createdAt: string;
}
