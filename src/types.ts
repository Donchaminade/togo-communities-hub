export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  website?: string;
}

export type CommunityStatus = 'pending' | 'approved' | 'rejected';

export interface Community {
  id?: string;
  name: string;
  description: string;
  logoUrl?: string;
  tags: string[];
  whatsappUrl?: string;
  telegramUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  neighborhood: string;
  lat?: number;
  lng?: number;
  leaderName: string;
  leaderEmail: string;
  leaderPhone?: string;
  status: CommunityStatus;
  createdAt: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
}

export interface NeighborhoodData {
  id: string;
  name: string;
  displayName: string;
  x: number; // For custom SVG map plotting
  y: number; // For custom SVG map plotting
  description: string;
}
