export type Faction = 'kolok' | 'laksa' | 'compromise';

export type KolokStyle = 'biasa' | 'merah' | 'kicap';

export interface Eatery {
  id: string;
  name: string;
  area: string; // e.g., 'Carpenter Street', 'Padungan', 'Matang', 'Tabuan Jaya'
  faction: Faction;
  rating: number; // 4.2 - 4.9
  fomoIndex: number; // 0 - 100
  fomoTrend: 'surging' | 'stable' | 'cooling';
  queueWaitMin: number;
  stockNote?: string; // e.g. "Only 8 bowls of broth remaining!", "Fresh lard batch ready"
  specialtyDish: string;
  signatureKolokStyle?: KolokStyle;
  priceRange: 'RM' | 'RM-RM' | 'RM-RM-RM';
  isHalalFriendly: boolean;
  isOpenNow: boolean;
  closingTime: string;
  coordinates: { x: number; y: number; lat: number; lng: number }; // x,y on stylized Kuching vector grid (0-1000)
  address: string;
  description: string;
  viralTags: string[];
  checkinVelocityPerHr: number;
  totalCheckinsToday: number;
  // Dynamic weather impact properties
  baseFomoIndex?: number;
  baseQueueWaitMin?: number;
  weatherCravingBoost?: number; // e.g. +22% or -6%
  weatherNotice?: string;
  weatherAvailabilityStatus?: 'high_demand' | 'critical_stock' | 'sheltered_rush' | 'normal';
}

export type WeatherCondition = 'rainy' | 'sunny' | 'cloudy';

export interface WeatherData {
  condition: WeatherCondition;
  title: string;
  localNickname: string; // e.g., "Hujan Lebat Tropika" or "Panas Terik Lit-Lit"
  tempC: number;
  humidityPct: number;
  windKmH: number;
  cravingFaction: 'laksa' | 'kolok' | 'neutral';
  cravingHeadline: string;
  cravingDescription: string;
  fomoBoostFaction: 'laksa' | 'kolok';
  fomoBoostAmount: number; // e.g. +20%
  stockDepletionAlert: string;
  recommendedDrink: string;
  updatedAt: string;
  isSimulating: boolean;
}

export interface WeatherImpactSummary {
  laksaAvgFomo: number;
  kolokAvgFomo: number;
  activeSurgeFaction: 'laksa' | 'kolok' | 'neutral';
  brothRiskLevel: 'CRITICAL' | 'ELEVATED' | 'STABLE';
  shelterStatus: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarEmoji: string;
  faction: 'kolok' | 'laksa';
  tierTitle: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  checkinCount: number;
  unlockedBadgeIds: string[];
  savedCoupons: SavedCoupon[];
  favoriteKolokStyle?: KolokStyle;
}

export interface SavedCoupon {
  id: string;
  eateryId: string;
  eateryName: string;
  title: string;
  code: string;
  discountText: string;
  expiresInMinutes: number;
  claimed: boolean;
}

export interface Badge {
  id: string;
  title: string;
  icon: string;
  description: string;
  faction: Faction | 'all';
  rarity: 'Common' | 'Rare' | 'Legendary';
  unlocked: boolean;
}

export interface SquadMember {
  id: string;
  name: string;
  faction: 'kolok' | 'laksa';
  avatarEmoji: string;
  isLeader?: boolean;
  status: 'paralyzed' | 'hungry' | 'voted';
  votedEateryId?: string;
}

export interface LiveCheckinEvent {
  id: string;
  userName: string;
  userFaction: 'kolok' | 'laksa';
  eateryId: string;
  eateryName: string;
  dishName: string;
  timestamp: string;
  fomoImpact: number;
  photoEmoji: string;
  comment: string;
}

export interface ActiveQuest {
  eateryId: string;
  eateryName: string;
  questTitle: string;
  targetDish: string;
  factionBonus: Faction;
  xpReward: number;
  couponReward: string;
  minutesRemaining: number;
}
