// src/api/endpoints.ts
import type {
  QRPayload, RedeemResponse, LeaderboardRow,
  PurchaseRecord, User, ImpactMonthly
} from "@/types";
import api from "./client";
import { rewards as rewardList } from "@/data/rewards";

const useMock = import.meta.env.VITE_USE_MOCK === "1";

/* ---------------- REAL IMPLEMENTATION ---------------- */
const real = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>("/auth/login", { email, password }).then(r => r.data),

  signup: (name: string, email: string, password: string) =>
    api.post<{ token: string; user: User }>("/auth/signup", { name, email, password }).then(r => r.data),

  redeemQR: (payload: QRPayload) =>
    api.post<RedeemResponse>("/refill/redeem", payload).then(r => r.data),

  getWallet: () =>
    api.get<{ user: User; recent: PurchaseRecord[] }>("/me/wallet").then(r => r.data),

  redeemReward: (rewardId: string) =>
  api.post<{ ok: true; user: User; rewardId: string }>("/rewards/redeem", { rewardId }).then(r => r.data),

  getLeaderboard: () =>
    api.get<LeaderboardRow[]>("/leaderboard").then(r => r.data),

  getImpact: () =>
    api.get<ImpactMonthly>("/impact").then(r => r.data),

  logout: async () => {
  // In real backend: call /auth/logout endpoint
  localStorage.clear();
  return { ok: true as const };
   },
};

/* ---------------- MOCK IMPLEMENTATION ---------------- */
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
const LS = {
  user: "mock_user",
  purchases: "mock_purchases",
  totals: "mock_totals",
  redemptions: "mock_redemptions",
};

function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback; }
  catch { return fallback; }
}
function save<T>(key: string, v: T) { localStorage.setItem(key, JSON.stringify(v)); }
function uid(prefix = "id"): string { return `${prefix}_${Math.random().toString(36).slice(2, 9)}`; }

// pricing table (SGD) & factors (tweak for demo)
const PRICE_PER_ML = 0.010; // 500ml => $2.50, 1L => $5.00
function priceFor(volumeMl: number) { return +(volumeMl * PRICE_PER_ML).toFixed(2); }

function calcFor(volumeMl: number) {
  const factor = volumeMl / 250;
  const points = Math.round(15 * factor);
  const plasticSavedG = Math.round(12 * factor);
  const co2SavedG = Math.round(plasticSavedG * 3.2);
  return { points, plasticSavedG, co2SavedG };
}

const seedIfEmpty = () => {
  const user = load<User | null>(LS.user, null);
  if (!user) {
    const seededUser: User = {
      id: "u_demo",
      name: "Demo Student",
      email: "test@eco.local",
      points: 120,
      badges: ["first-refill"],
      role: "user",
    };
    save(LS.user, seededUser);

    const purchases: PurchaseRecord[] = [
      { id: uid("p"), productId: "shampoo-500", volumeMl: 500, ...calcFor(500), priceSgd: priceFor(500), createdAt: new Date(Date.now()-86400000*6).toISOString() },
      { id: uid("p"), productId: "detergent-1000", volumeMl: 1000, ...calcFor(1000), priceSgd: priceFor(1000), createdAt: new Date(Date.now()-86400000*2).toISOString() },
    ];
    save(LS.purchases, purchases);

    const totals = purchases.reduce((a, r) => ({
      points: a.points + r.points,
      plasticSavedG: a.plasticSavedG + r.plasticSavedG,
      co2SavedG: a.co2SavedG + r.co2SavedG,
    }), { points: 0, plasticSavedG: 0, co2SavedG: 0 });
    save(LS.totals, totals);
  }
};

const mock = {
  async login(email: string, _password: string) {
    seedIfEmpty();
    await sleep(400);
    const user = load<User>(LS.user, {
      id: "u_demo", name: "Demo Student", email: "test@eco.local", points: 0, badges: [], role: "user",
    });
    if (email !== user.email) {
      const newUser: User = { id: uid("u"), name: email.split("@")[0], email, points: 0, badges: [], role: "user" };
      save(LS.user, newUser);
      save(LS.purchases, []);
      save(LS.totals, { points: 0, plasticSavedG: 0, co2SavedG: 0 });
    }
    return { token: "mock-token", user: load<User>(LS.user, user) };
  },

  async signup(name: string, email: string, _password: string) {
    await sleep(400);
    const newUser: User = { id: uid("u"), name, email, points: 0, badges: [], role: "user" };
    save(LS.user, newUser);
    save(LS.purchases, []);
    save(LS.totals, { points: 0, plasticSavedG: 0, co2SavedG: 0 });
    return { token: "mock-token", user: newUser };
  },

  async redeemQR(payload: QRPayload) {
  await sleep(300);
  const user = load<User>(LS.user, null as any);
  if (!user) throw new Error("Not logged in");

  const calc = calcFor(payload.volumeMl);

  const purchase: PurchaseRecord = {
    id: uid("p"),
    productId: payload.productId,
    volumeMl: payload.volumeMl,
    // NEW: carry over brand from payload (trim and ignore empty)
    brand: payload.brand?.trim() ? payload.brand.trim() : undefined,
    points: calc.points,
    plasticSavedG: calc.plasticSavedG,
    co2SavedG: calc.co2SavedG,
    priceSgd: priceFor(payload.volumeMl),
    createdAt: new Date().toISOString(),
  };

  const purchases = [purchase, ...load<PurchaseRecord[]>(LS.purchases, [])].slice(0, 50);
  save(LS.purchases, purchases);

  const totals = load<{ points: number; plasticSavedG: number; co2SavedG: number }>(
    LS.totals,
    { points: 0, plasticSavedG: 0, co2SavedG: 0 }
  );
  totals.points += calc.points;
  totals.plasticSavedG += calc.plasticSavedG;
  totals.co2SavedG += calc.co2SavedG;
  save(LS.totals, totals);

  const updatedUser = { ...user, points: totals.points };
  save(LS.user, updatedUser);

  const res: RedeemResponse = { user: updatedUser, purchase, totals };
  return res;
},

  async redeemReward(rewardId: string) {
  await sleep(300);
  const user = load<User>(LS.user, null as any);
  if (!user) throw new Error("Not logged in");

  const reward = rewardList.find(r => r.id === rewardId);
  if (!reward) throw new Error("Reward not found");

  if (user.points < reward.pointsRequired) {
    throw new Error("Not enough points");
  }

  // deduct points
  const updatedUser: User = { ...user, points: user.points - reward.pointsRequired };
  save(LS.user, updatedUser);

  // store redemption record
  const redemptions = load<{ id: string; rewardId: string; title: string; points: number; at: string }[]>(
    LS.redemptions, []
  );
  redemptions.unshift({
    id: `redeem_${Math.random().toString(36).slice(2, 9)}`,
    rewardId: reward.id,
    title: reward.title,
    points: reward.pointsRequired,
    at: new Date().toISOString(),
  });
  save(LS.redemptions, redemptions);

  // (optional) also expose via an endpoint later if you want a "Redemption History" page

  return { ok: true as const, user: updatedUser, rewardId };
},

  async getWallet() {
    seedIfEmpty();                 // ensure demo data exists
    await sleep(200);
    const user = load<User>(LS.user, null as any);
    const recent = load<PurchaseRecord[]>(LS.purchases, []);
    return { user, recent };
  },

  async getLeaderboard() {
    seedIfEmpty();
    await sleep(250);
    const you = load<User>(LS.user, null as any);
    const rows: LeaderboardRow[] = [
      { rank: 1, user: "Alex", points: 520 },
      { rank: 2, user: "Bella", points: 420 },
      { rank: 3, user: "Charlie", points: 270 },
      { rank: 4, user: you?.name ?? "You", points: you?.points ?? 0 },
      { rank: 5, user: "Dana", points: 110 },
    ];
    return rows.sort((a,b)=>b.points-a.points).map((r,i)=>({...r, rank:i+1}));
  },

  async getImpact() {
    seedIfEmpty();
    await sleep(200);
    const now = new Date();
    const byMonth: { month: string; plasticSavedG: number; co2SavedG: number }[] = [];
    const communityAvgByMonth: { month: string; plasticSavedG: number; co2SavedG: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
      const label = d.toLocaleDateString(undefined, { month: "short" });
      const p = Math.round(200 + Math.random()*300);
      const c = Math.round(600 + Math.random()*900);
      byMonth.push({ month: label, plasticSavedG: p, co2SavedG: c });
      communityAvgByMonth.push({ month: label, plasticSavedG: Math.round(p*0.75), co2SavedG: Math.round(c*0.75) });
    }
    const out: ImpactMonthly = { byMonth, communityAvgByMonth };
    return out;
  },

  async logout() {
  localStorage.clear();
  return { ok: true as const };
},
};

export const endpoints = useMock ? mock : real;
