export interface Trip {
  id: string;
  title: string;
  destination: string;
  description: string;
  image: string;
  price: number;
  originalPrice?: number;
  duration: string;
  startDate: string;
  endDate: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  type: 'solo' | 'group' | 'college' | 'school';
  category: string;
  rating: number;
  reviewCount: number;
  spotsLeft: number;
  totalSpots: number;
  minPeople?: number;
  organizer: Organizer;
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  highlights: string[];
  isFeatured?: boolean;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals?: string[];
  accommodation?: string;
}

export interface Organizer {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  tripCount: number;
  verified: boolean;
  description?: string;
  specialties?: string[];
}

export interface Booking {
  id: string;
  tripId: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  seats: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  trip?: Trip;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'organizer' | 'admin';
  createdAt: string;
}

export interface Review {
  id: string;
  tripId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}
