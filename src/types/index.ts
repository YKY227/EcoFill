export type QRPayload = {
  stationId: string;
  productId: string;
  volumeMl: number;
  txnId: string;
  ts: string;
  signature: string;
  brand?: string;
};

export type PurchaseRecord = {
  id: string;
  productId: string;
  volumeMl: number;
  points: number;
  plasticSavedG: number;
  co2SavedG: number;
  priceSgd?: number;        // ← NEW
  createdAt: string;
  brand?: string;      // ← NEW
};

export type User = {
  id: string;
  name: string;
  email: string;
  points: number;
  badges: string[];
  role?: 'admin' | 'user';
};

export type LeaderboardRow = { user: string; points: number; rank: number };

export type RedeemResponse = {
  user: User;
  purchase: PurchaseRecord;
  totals: {
    points: number;
    plasticSavedG: number;
    co2SavedG: number;
  };
};

export type ImpactMonthly = {
  byMonth: { month: string; plasticSavedG: number; co2SavedG: number }[];
  communityAvgByMonth?: { month: string; plasticSavedG: number; co2SavedG: number }[]; // ← NEW
};
