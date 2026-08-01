// ============================================================
// Afriframe Studio CMS — Mock Data
// ============================================================

export interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAvatar: string;
  service: string;
  date: string;
  time: string;
  duration: string;
  photographer: string;
  photographerAvatar: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'upcoming';
  location: string;
  package: string;
  amount: number;
  notes: string;
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  action: string;
  by: string;
  date: string;
  time: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  photographer: string;
  photographerAvatar: string;
  uploadDate: string;
  tags: string[];
  visibility: 'public' | 'private' | 'draft';
  imageUrl: string;
  width: number;
  height: number;
  views: number;
  downloads: number;
  collectionId?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  category: string;
  photographer: string;
  photographerAvatar: string;
  uploadDate: string;
  duration: string;
  tags: string[];
  visibility: 'public' | 'private' | 'draft';
  thumbnailUrl: string;
  views: number;
  size: string;
}

export interface Collection {
  id: string;
  name: string;
  coverImage: string;
  category: string;
  itemCount: number;
  updatedAt: string;
  description: string;
  status: 'active' | 'archived';
}

export interface Photographer {
  id: string;
  name: string;
  role: string;
  avatar: string;
  phone: string;
  email: string;
  instagram: string;
  projectsCompleted: number;
  availability: 'available' | 'booked' | 'on-leave';
  rating: number;
  specialization: string[];
  joinDate: string;
  location: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  location: string;
  totalBookings: number;
  totalSpent: number;
  lastBooking: string;
  status: 'active' | 'inactive' | 'vip';
  notes: string;
  joinDate: string;
}

export interface Notification {
  id: string;
  type: 'booking' | 'upload' | 'message' | 'system' | 'payment';
  title: string;
  message: string;
  time: string;
  read: boolean;
  avatar?: string;
  actionUrl?: string;
}

// ─── Bookings ───────────────────────────────────────────────
export const mockBookings: Booking[] = [
  {
    id: 'BK-2401',
    clientName: 'Amara Osei',
    clientEmail: 'amara.osei@gmail.com',
    clientPhone: '+233 55 123 4567',
    clientAvatar: 'https://images.pexels.com/photos/23471215/pexels-photo-23471215.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    service: 'Wedding Photography',
    date: '2025-02-14',
    time: '10:00 AM',
    duration: '8 hours',
    photographer: 'Kofi Mensah',
    photographerAvatar: 'https://images.pexels.com/photos/9866566/pexels-photo-9866566.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    status: 'confirmed',
    location: 'Accra International Conference Centre',
    package: 'Platinum Package',
    amount: 8500,
    notes: 'Client requests golden hour shots and specific family groupings. Drone footage required.',
    timeline: [
      { id: 't1', action: 'Booking Created', by: 'Amara Osei', date: '2025-01-10', time: '9:30 AM' },
      { id: 't2', action: 'Payment Received (50%)', by: 'System', date: '2025-01-11', time: '2:15 PM' },
      { id: 't3', action: 'Photographer Assigned', by: 'Admin', date: '2025-01-12', time: '11:00 AM' },
      { id: 't4', action: 'Booking Confirmed', by: 'Admin', date: '2025-01-12', time: '11:05 AM' },
    ],
  },
  {
    id: 'BK-2402',
    clientName: 'Zara Mensah',
    clientEmail: 'zara.m@outlook.com',
    clientPhone: '+233 20 987 6543',
    clientAvatar: 'https://images.pexels.com/photos/9514677/pexels-photo-9514677.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    service: 'Portrait Session',
    date: '2025-01-28',
    time: '2:00 PM',
    duration: '2 hours',
    photographer: 'Ama Darko',
    photographerAvatar: 'https://images.pexels.com/photos/2479946/pexels-photo-2479946.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    status: 'pending',
    location: 'Afriframe Studio, East Legon',
    package: 'Silver Package',
    amount: 1200,
    notes: 'Professional headshots for LinkedIn and corporate profile.',
    timeline: [
      { id: 't1', action: 'Booking Created', by: 'Zara Mensah', date: '2025-01-20', time: '4:00 PM' },
      { id: 't2', action: 'Awaiting Confirmation', by: 'System', date: '2025-01-20', time: '4:01 PM' },
    ],
  },
  {
    id: 'BK-2403',
    clientName: 'Kwame Asante',
    clientEmail: 'kwame.asante@business.com',
    clientPhone: '+233 24 555 7890',
    clientAvatar: 'https://images.pexels.com/photos/2479946/pexels-photo-2479946.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    service: 'Corporate Event',
    date: '2025-01-30',
    time: '8:00 AM',
    duration: '6 hours',
    photographer: 'Kwesi Boateng',
    photographerAvatar: 'https://images.pexels.com/photos/9866568/pexels-photo-9866568.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    status: 'upcoming',
    location: 'Movenpick Ambassador Hotel, Accra',
    package: 'Gold Package',
    amount: 4500,
    notes: 'Annual conference for 500+ attendees. Press coverage required.',
    timeline: [
      { id: 't1', action: 'Booking Created', by: 'Kwame Asante', date: '2025-01-15', time: '10:00 AM' },
      { id: 't2', action: 'Payment Received (Full)', by: 'System', date: '2025-01-15', time: '10:30 AM' },
      { id: 't3', action: 'Confirmed & Scheduled', by: 'Admin', date: '2025-01-16', time: '9:00 AM' },
    ],
  },
  {
    id: 'BK-2404',
    clientName: 'Abena Frimpong',
    clientEmail: 'abena.f@gmail.com',
    clientPhone: '+233 50 234 5678',
    clientAvatar: 'https://images.pexels.com/photos/1066171/pexels-photo-1066171.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    service: 'Graduation Photography',
    date: '2025-01-25',
    time: '9:00 AM',
    duration: '3 hours',
    photographer: 'Ama Darko',
    photographerAvatar: 'https://images.pexels.com/photos/2479946/pexels-photo-2479946.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    status: 'completed',
    location: 'University of Ghana, Legon',
    package: 'Bronze Package',
    amount: 900,
    notes: 'UGBS graduation. Both studio and outdoor shots required.',
    timeline: [
      { id: 't1', action: 'Booking Created', by: 'Abena Frimpong', date: '2025-01-10', time: '3:00 PM' },
      { id: 't2', action: 'Confirmed', by: 'Admin', date: '2025-01-11', time: '9:00 AM' },
      { id: 't3', action: 'Shoot Completed', by: 'Ama Darko', date: '2025-01-25', time: '12:00 PM' },
      { id: 't4', action: 'Gallery Delivered', by: 'System', date: '2025-01-27', time: '6:00 PM' },
    ],
  },
  {
    id: 'BK-2405',
    clientName: 'Nana Adjei',
    clientEmail: 'nana.adjei@corp.gh',
    clientPhone: '+233 27 876 5432',
    clientAvatar: 'https://images.pexels.com/photos/9866569/pexels-photo-9866569.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    service: 'Fashion Editorial',
    date: '2025-02-01',
    time: '11:00 AM',
    duration: '5 hours',
    photographer: 'Kofi Mensah',
    photographerAvatar: 'https://images.pexels.com/photos/9866566/pexels-photo-9866566.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    status: 'confirmed',
    location: 'Labone, Accra',
    package: 'Editorial Package',
    amount: 3200,
    notes: 'Campaign shoot for new clothing line. 3 outfit changes.',
    timeline: [
      { id: 't1', action: 'Booking Created', by: 'Nana Adjei', date: '2025-01-18', time: '1:00 PM' },
      { id: 't2', action: 'Deposit Received', by: 'System', date: '2025-01-19', time: '11:00 AM' },
      { id: 't3', action: 'Confirmed', by: 'Admin', date: '2025-01-19', time: '2:00 PM' },
    ],
  },
  {
    id: 'BK-2406',
    clientName: 'Efua Boateng',
    clientEmail: 'efua.b@gmail.com',
    clientPhone: '+233 54 321 0987',
    clientAvatar: 'https://images.pexels.com/photos/33714925/pexels-photo-33714925.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    service: 'Church Event',
    date: '2025-02-05',
    time: '7:00 AM',
    duration: '4 hours',
    photographer: 'Kwesi Boateng',
    photographerAvatar: 'https://images.pexels.com/photos/9866568/pexels-photo-9866568.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    status: 'pending',
    location: 'Action Chapel International, Accra',
    package: 'Standard Package',
    amount: 1800,
    notes: 'Annual thanksgiving service and baptism ceremony.',
    timeline: [
      { id: 't1', action: 'Booking Created', by: 'Efua Boateng', date: '2025-01-22', time: '7:30 PM' },
    ],
  },
];

// ─── Portfolio ───────────────────────────────────────────────
export const mockPortfolio: PortfolioItem[] = [
  {
    id: 'p1',
    title: 'Golden Hour Wedding — Amara & Eric',
    category: 'Weddings',
    photographer: 'Kofi Mensah',
    photographerAvatar: 'https://images.pexels.com/photos/9866566/pexels-photo-9866566.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    uploadDate: '2025-01-15',
    tags: ['wedding', 'golden-hour', 'romantic', 'outdoor'],
    visibility: 'public',
    imageUrl: 'https://images.pexels.com/photos/15686962/pexels-photo-15686962.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    width: 1200,
    height: 627,
    views: 2847,
    downloads: 12,
    collectionId: 'c1',
  },
  {
    id: 'p2',
    title: 'Bridal Elegance — Black & White Series',
    category: 'Weddings',
    photographer: 'Ama Darko',
    photographerAvatar: 'https://images.pexels.com/photos/2479946/pexels-photo-2479946.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    uploadDate: '2025-01-12',
    tags: ['wedding', 'bridal', 'black-white', 'elegant'],
    visibility: 'public',
    imageUrl: 'https://images.pexels.com/photos/38765823/pexels-photo-38765823.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    width: 1200,
    height: 800,
    views: 1923,
    downloads: 8,
    collectionId: 'c1',
  },
  {
    id: 'p3',
    title: 'Fashion Editorial — Cream & Gold',
    category: 'Fashion',
    photographer: 'Kofi Mensah',
    photographerAvatar: 'https://images.pexels.com/photos/9866566/pexels-photo-9866566.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    uploadDate: '2025-01-10',
    tags: ['fashion', 'editorial', 'studio', 'portrait'],
    visibility: 'public',
    imageUrl: 'https://images.pexels.com/photos/9514677/pexels-photo-9514677.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
    width: 800,
    height: 1200,
    views: 3412,
    downloads: 24,
    collectionId: 'c5',
  },
  {
    id: 'p4',
    title: 'Blue Hour Portrait',
    category: 'Portraits',
    photographer: 'Kwesi Boateng',
    photographerAvatar: 'https://images.pexels.com/photos/9866568/pexels-photo-9866568.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    uploadDate: '2025-01-08',
    tags: ['portrait', 'moody', 'editorial', 'studio'],
    visibility: 'public',
    imageUrl: 'https://images.pexels.com/photos/1066171/pexels-photo-1066171.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
    width: 800,
    height: 1200,
    views: 1567,
    downloads: 6,
    collectionId: 'c2',
  },
  {
    id: 'p5',
    title: 'Lakeside Wedding — Dock Series',
    category: 'Weddings',
    photographer: 'Ama Darko',
    photographerAvatar: 'https://images.pexels.com/photos/2479946/pexels-photo-2479946.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    uploadDate: '2025-01-05',
    tags: ['wedding', 'outdoor', 'lake', 'sunset'],
    visibility: 'public',
    imageUrl: 'https://images.pexels.com/photos/8700946/pexels-photo-8700946.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    width: 1200,
    height: 800,
    views: 4231,
    downloads: 31,
    collectionId: 'c1',
  },
  {
    id: 'p6',
    title: 'Grand Arrival — Bridal Venue',
    category: 'Weddings',
    photographer: 'Kofi Mensah',
    photographerAvatar: 'https://images.pexels.com/photos/9866566/pexels-photo-9866566.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    uploadDate: '2025-01-03',
    tags: ['wedding', 'venue', 'luxury', 'arrival'],
    visibility: 'public',
    imageUrl: 'https://images.pexels.com/photos/32167154/pexels-photo-32167154.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    width: 1200,
    height: 800,
    views: 2100,
    downloads: 14,
    collectionId: 'c1',
  },
  {
    id: 'p7',
    title: 'Joyful Moments — Pre-Ceremony',
    category: 'Weddings',
    photographer: 'Kwesi Boateng',
    photographerAvatar: 'https://images.pexels.com/photos/9866568/pexels-photo-9866568.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    uploadDate: '2024-12-28',
    tags: ['wedding', 'candid', 'emotion', 'ceremony'],
    visibility: 'public',
    imageUrl: 'https://images.pexels.com/photos/32167251/pexels-photo-32167251.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    width: 1200,
    height: 800,
    views: 1876,
    downloads: 9,
    collectionId: 'c1',
  },
  {
    id: 'p8',
    title: 'Studio Series — Red Drama',
    category: 'Fashion',
    photographer: 'Ama Darko',
    photographerAvatar: 'https://images.pexels.com/photos/2479946/pexels-photo-2479946.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    uploadDate: '2024-12-20',
    tags: ['fashion', 'studio', 'red', 'dramatic'],
    visibility: 'public',
    imageUrl: 'https://images.pexels.com/photos/33714925/pexels-photo-33714925.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
    width: 800,
    height: 1200,
    views: 5643,
    downloads: 42,
    collectionId: 'c5',
  },
  {
    id: 'p9',
    title: 'Behind the Lens — Studio BTS',
    category: 'Commercial',
    photographer: 'Kofi Mensah',
    photographerAvatar: 'https://images.pexels.com/photos/9866566/pexels-photo-9866566.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    uploadDate: '2024-12-15',
    tags: ['bts', 'studio', 'commercial', 'team'],
    visibility: 'private',
    imageUrl: 'https://images.pexels.com/photos/33714920/pexels-photo-33714920.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
    width: 800,
    height: 1200,
    views: 342,
    downloads: 2,
    collectionId: 'c3',
  },
  {
    id: 'p10',
    title: 'Black Blazer — Power Portrait',
    category: 'Portraits',
    photographer: 'Kwesi Boateng',
    photographerAvatar: 'https://images.pexels.com/photos/9866568/pexels-photo-9866568.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    uploadDate: '2024-12-10',
    tags: ['portrait', 'professional', 'corporate', 'studio'],
    visibility: 'public',
    imageUrl: 'https://images.pexels.com/photos/17945059/pexels-photo-17945059.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
    width: 800,
    height: 1200,
    views: 2213,
    downloads: 17,
    collectionId: 'c2',
  },
  {
    id: 'p11',
    title: 'Photography Team Crew',
    category: 'Commercial',
    photographer: 'Ama Darko',
    photographerAvatar: 'https://images.pexels.com/photos/2479946/pexels-photo-2479946.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    uploadDate: '2024-12-08',
    tags: ['team', 'bts', 'commercial', 'crew'],
    visibility: 'private',
    imageUrl: 'https://images.pexels.com/photos/9866568/pexels-photo-9866568.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    width: 940,
    height: 650,
    views: 189,
    downloads: 1,
    collectionId: 'c3',
  },
  {
    id: 'p12',
    title: 'Studio Photography Session',
    category: 'Portraits',
    photographer: 'Kofi Mensah',
    photographerAvatar: 'https://images.pexels.com/photos/9866566/pexels-photo-9866566.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    uploadDate: '2024-12-05',
    tags: ['studio', 'session', 'professional', 'lighting'],
    visibility: 'public',
    imageUrl: 'https://images.pexels.com/photos/19222076/pexels-photo-19222076.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
    width: 800,
    height: 1200,
    views: 1432,
    downloads: 11,
    collectionId: 'c2',
  },
];

// ─── Videos ─────────────────────────────────────────────────
export const mockVideos: VideoItem[] = [
  {
    id: 'v1',
    title: 'Wedding Highlight Reel — Amara & Eric',
    category: 'Weddings',
    photographer: 'Kofi Mensah',
    photographerAvatar: 'https://images.pexels.com/photos/9866566/pexels-photo-9866566.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    uploadDate: '2025-01-16',
    duration: '4:32',
    tags: ['wedding', 'highlight', 'cinematic', 'emotional'],
    visibility: 'public',
    thumbnailUrl: 'https://images.pexels.com/photos/15686962/pexels-photo-15686962.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    views: 8234,
    size: '2.4 GB',
  },
  {
    id: 'v2',
    title: 'Fashion Campaign — Spring Collection 2025',
    category: 'Fashion',
    photographer: 'Ama Darko',
    photographerAvatar: 'https://images.pexels.com/photos/2479946/pexels-photo-2479946.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    uploadDate: '2025-01-10',
    duration: '2:15',
    tags: ['fashion', 'campaign', 'editorial', 'brand'],
    visibility: 'public',
    thumbnailUrl: 'https://images.pexels.com/photos/9514677/pexels-photo-9514677.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    views: 5621,
    size: '1.1 GB',
  },
  {
    id: 'v3',
    title: 'Corporate Event Coverage — TechGhana Summit',
    category: 'Corporate',
    photographer: 'Kwesi Boateng',
    photographerAvatar: 'https://images.pexels.com/photos/9866568/pexels-photo-9866568.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    uploadDate: '2025-01-05',
    duration: '6:48',
    tags: ['corporate', 'event', 'conference', 'summary'],
    visibility: 'private',
    thumbnailUrl: 'https://images.pexels.com/photos/8700946/pexels-photo-8700946.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    views: 1203,
    size: '3.7 GB',
  },
  {
    id: 'v4',
    title: 'Graduation Day Memories — UG Class 2024',
    category: 'Graduation',
    photographer: 'Ama Darko',
    photographerAvatar: 'https://images.pexels.com/photos/2479946/pexels-photo-2479946.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    uploadDate: '2024-12-30',
    duration: '3:20',
    tags: ['graduation', 'memories', 'celebration', 'montage'],
    visibility: 'public',
    thumbnailUrl: 'https://images.pexels.com/photos/32167154/pexels-photo-32167154.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    views: 3456,
    size: '1.8 GB',
  },
  {
    id: 'v5',
    title: 'Church Anniversary — Action Chapel 2024',
    category: 'Church',
    photographer: 'Kofi Mensah',
    photographerAvatar: 'https://images.pexels.com/photos/9866566/pexels-photo-9866566.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    uploadDate: '2024-12-20',
    duration: '8:05',
    tags: ['church', 'anniversary', 'event', 'worship'],
    visibility: 'public',
    thumbnailUrl: 'https://images.pexels.com/photos/32167251/pexels-photo-32167251.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    views: 6712,
    size: '4.2 GB',
  },
  {
    id: 'v6',
    title: 'Portrait Session BTS — Studio Vibes',
    category: 'Portraits',
    photographer: 'Kwesi Boateng',
    photographerAvatar: 'https://images.pexels.com/photos/9866568/pexels-photo-9866568.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    uploadDate: '2024-12-15',
    duration: '1:45',
    tags: ['bts', 'portrait', 'studio', 'behind-scenes'],
    visibility: 'draft',
    thumbnailUrl: 'https://images.pexels.com/photos/33714920/pexels-photo-33714920.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
    views: 234,
    size: '0.9 GB',
  },
];

// ─── Collections ─────────────────────────────────────────────
export const mockCollections: Collection[] = [
  {
    id: 'c1',
    name: 'Weddings',
    coverImage: 'https://images.pexels.com/photos/15686962/pexels-photo-15686962.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    category: 'Weddings',
    itemCount: 247,
    updatedAt: '2025-01-15',
    description: 'Luxury wedding photography and videography collections.',
    status: 'active',
  },
  {
    id: 'c2',
    name: 'Portraits',
    coverImage: 'https://images.pexels.com/photos/9514677/pexels-photo-9514677.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
    category: 'Portraits',
    itemCount: 134,
    updatedAt: '2025-01-12',
    description: 'Professional portrait photography sessions.',
    status: 'active',
  },
  {
    id: 'c3',
    name: 'Commercial',
    coverImage: 'https://images.pexels.com/photos/33714920/pexels-photo-33714920.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
    category: 'Commercial',
    itemCount: 89,
    updatedAt: '2025-01-08',
    description: 'Brand campaigns and commercial photography.',
    status: 'active',
  },
  {
    id: 'c4',
    name: 'Events',
    coverImage: 'https://images.pexels.com/photos/8700946/pexels-photo-8700946.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    category: 'Events',
    itemCount: 312,
    updatedAt: '2025-01-05',
    description: 'Corporate events, conferences, and social gatherings.',
    status: 'active',
  },
  {
    id: 'c5',
    name: 'Fashion',
    coverImage: 'https://images.pexels.com/photos/33714925/pexels-photo-33714925.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
    category: 'Fashion',
    itemCount: 178,
    updatedAt: '2024-12-28',
    description: 'Editorial fashion and campaign photography.',
    status: 'active',
  },
  {
    id: 'c6',
    name: 'Graduation',
    coverImage: 'https://images.pexels.com/photos/32167154/pexels-photo-32167154.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    category: 'Graduation',
    itemCount: 93,
    updatedAt: '2024-12-30',
    description: 'University and school graduation ceremonies.',
    status: 'active',
  },
  {
    id: 'c7',
    name: 'Church',
    coverImage: 'https://images.pexels.com/photos/32167251/pexels-photo-32167251.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    category: 'Church',
    itemCount: 64,
    updatedAt: '2024-12-20',
    description: 'Church events, celebrations, and services.',
    status: 'active',
  },
  {
    id: 'c8',
    name: 'Corporate',
    coverImage: 'https://images.pexels.com/photos/9866568/pexels-photo-9866568.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    category: 'Corporate',
    itemCount: 56,
    updatedAt: '2024-12-15',
    description: 'Corporate branding and team photography.',
    status: 'active',
  },
];

// ─── Photographers ────────────────────────────────────────────
export const mockPhotographers: Photographer[] = [
  {
    id: 'ph1',
    name: 'Kofi Mensah',
    role: 'Lead Photographer',
    avatar: 'https://images.pexels.com/photos/9866566/pexels-photo-9866566.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    phone: '+233 24 112 3456',
    email: 'kofi@afriframestudio.com',
    instagram: '@kofi.frames',
    projectsCompleted: 342,
    availability: 'available',
    rating: 4.9,
    specialization: ['Weddings', 'Fashion', 'Editorial'],
    joinDate: '2020-03-15',
    location: 'East Legon, Accra',
  },
  {
    id: 'ph2',
    name: 'Ama Darko',
    role: 'Senior Photographer',
    avatar: 'https://images.pexels.com/photos/2479946/pexels-photo-2479946.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    phone: '+233 50 234 5678',
    email: 'ama@afriframestudio.com',
    instagram: '@ama.captures',
    projectsCompleted: 218,
    availability: 'booked',
    rating: 4.8,
    specialization: ['Portraits', 'Graduation', 'Corporate'],
    joinDate: '2021-06-01',
    location: 'Cantonments, Accra',
  },
  {
    id: 'ph3',
    name: 'Kwesi Boateng',
    role: 'Videographer & Photographer',
    avatar: 'https://images.pexels.com/photos/9866568/pexels-photo-9866568.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    phone: '+233 27 345 6789',
    email: 'kwesi@afriframestudio.com',
    instagram: '@kwesi.vision',
    projectsCompleted: 156,
    availability: 'available',
    rating: 4.7,
    specialization: ['Events', 'Church', 'Corporate', 'Video'],
    joinDate: '2022-01-10',
    location: 'Airport Residential, Accra',
  },
  {
    id: 'ph4',
    name: 'Akosua Amponsah',
    role: 'Second Shooter',
    avatar: 'https://images.pexels.com/photos/23471215/pexels-photo-23471215.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    phone: '+233 20 456 7890',
    email: 'akosua@afriframestudio.com',
    instagram: '@akosua.lens',
    projectsCompleted: 87,
    availability: 'on-leave',
    rating: 4.6,
    specialization: ['Weddings', 'Events', 'Portraits'],
    joinDate: '2023-04-20',
    location: 'Tema, Greater Accra',
  },
  {
    id: 'ph5',
    name: 'Yaw Asiedu',
    role: 'Photo Editor & Retoucher',
    avatar: 'https://images.pexels.com/photos/9866569/pexels-photo-9866569.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    phone: '+233 54 567 8901',
    email: 'yaw@afriframestudio.com',
    instagram: '@yaw.edits',
    projectsCompleted: 423,
    availability: 'available',
    rating: 5.0,
    specialization: ['Editing', 'Retouching', 'Color Grading'],
    joinDate: '2019-11-05',
    location: 'Labone, Accra',
  },
];

// ─── Clients ──────────────────────────────────────────────────
export const mockClients: Client[] = [
  {
    id: 'cl1',
    name: 'Amara Osei',
    email: 'amara.osei@gmail.com',
    phone: '+233 55 123 4567',
    avatar: 'https://images.pexels.com/photos/23471215/pexels-photo-23471215.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    location: 'Accra, Ghana',
    totalBookings: 3,
    totalSpent: 14200,
    lastBooking: '2025-01-15',
    status: 'vip',
    notes: 'Prefers early morning sessions. Very detail-oriented client.',
    joinDate: '2023-06-10',
  },
  {
    id: 'cl2',
    name: 'Zara Mensah',
    email: 'zara.m@outlook.com',
    phone: '+233 20 987 6543',
    avatar: 'https://images.pexels.com/photos/9514677/pexels-photo-9514677.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    location: 'Kumasi, Ghana',
    totalBookings: 1,
    totalSpent: 1200,
    lastBooking: '2025-01-28',
    status: 'active',
    notes: 'New client. Referred by Amara Osei.',
    joinDate: '2025-01-20',
  },
  {
    id: 'cl3',
    name: 'Kwame Asante',
    email: 'kwame.asante@business.com',
    phone: '+233 24 555 7890',
    avatar: 'https://images.pexels.com/photos/2479946/pexels-photo-2479946.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    location: 'Accra, Ghana',
    totalBookings: 5,
    totalSpent: 22500,
    lastBooking: '2025-01-30',
    status: 'vip',
    notes: 'Corporate client. Books quarterly events.',
    joinDate: '2022-03-15',
  },
  {
    id: 'cl4',
    name: 'Abena Frimpong',
    email: 'abena.f@gmail.com',
    phone: '+233 50 234 5678',
    avatar: 'https://images.pexels.com/photos/1066171/pexels-photo-1066171.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    location: 'Legon, Accra',
    totalBookings: 2,
    totalSpent: 2100,
    lastBooking: '2025-01-25',
    status: 'active',
    notes: 'Booked for graduation and family portrait session.',
    joinDate: '2024-11-20',
  },
  {
    id: 'cl5',
    name: 'Nana Adjei',
    email: 'nana.adjei@corp.gh',
    phone: '+233 27 876 5432',
    avatar: 'https://images.pexels.com/photos/9866569/pexels-photo-9866569.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
    location: 'Accra, Ghana',
    totalBookings: 4,
    totalSpent: 12800,
    lastBooking: '2025-02-01',
    status: 'vip',
    notes: 'Fashion industry client. Quarterly editorial campaigns.',
    joinDate: '2023-01-08',
  },
];

// ─── Notifications ────────────────────────────────────────────
export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'booking',
    title: 'New Booking Request',
    message: 'Efua Boateng has requested a Church Event photography session for Feb 5.',
    time: '5 minutes ago',
    read: false,
    avatar: 'https://images.pexels.com/photos/33714925/pexels-photo-33714925.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
  },
  {
    id: 'n2',
    type: 'payment',
    title: 'Payment Received',
    message: 'Kwame Asante has paid GH₵ 4,500 for Corporate Event booking BK-2403.',
    time: '23 minutes ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'message',
    title: 'New Message from Amara Osei',
    message: 'Hi, can we discuss the shot list for the wedding? I have some specific requests.',
    time: '1 hour ago',
    read: false,
    avatar: 'https://images.pexels.com/photos/23471215/pexels-photo-23471215.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
  },
  {
    id: 'n4',
    type: 'upload',
    title: 'Gallery Ready for Review',
    message: 'Kofi Mensah has uploaded 127 photos from the Amara & Eric wedding.',
    time: '2 hours ago',
    read: true,
    avatar: 'https://images.pexels.com/photos/9866566/pexels-photo-9866566.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
  },
  {
    id: 'n5',
    type: 'system',
    title: 'Storage Alert',
    message: 'You are using 87% of your storage. Consider archiving old collections.',
    time: '3 hours ago',
    read: true,
  },
  {
    id: 'n6',
    type: 'booking',
    title: 'Booking Confirmed',
    message: 'Nana Adjei\'s Fashion Editorial session has been confirmed for Feb 1.',
    time: '5 hours ago',
    read: true,
    avatar: 'https://images.pexels.com/photos/9866569/pexels-photo-9866569.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
  },
  {
    id: 'n7',
    type: 'upload',
    title: 'New Video Uploaded',
    message: 'Ama Darko uploaded the Spring Collection 2025 fashion video.',
    time: '1 day ago',
    read: true,
    avatar: 'https://images.pexels.com/photos/2479946/pexels-photo-2479946.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
  },
  {
    id: 'n8',
    type: 'booking',
    title: 'Booking Completed',
    message: 'Abena Frimpong\'s graduation photography session has been marked complete.',
    time: '2 days ago',
    read: true,
    avatar: 'https://images.pexels.com/photos/1066171/pexels-photo-1066171.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=200',
  },
];
