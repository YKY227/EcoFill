import { Link } from "react-router-dom";
import { useLiveWallet } from "@/hooks/useLiveWallet";
import Skeleton from "@/ui/Skeleton";
import BadgeGrid from "@/components/BadgeGrid";
import StatCard from "@/components/StatCard";
import ProgressBar from "@/ui/ProgressBar";
import Confetti from "@/ui/Confetti";
import { money, int } from "@/utils/format";


function computeBadges(points: number, plasticSavedG: number) {
  return [
    { id: "first-refill", label: "First Refill", earned: points > 0 },
    { id: "silver-200", label: "Silver (200 pts)", earned: points >= 200 },
    { id: "gold-500", label: "Gold (500 pts)", earned: points >= 500 },
    { id: "1kg-plastic", label: "1kg Plastic Saved", earned: plasticSavedG >= 1000 },
  ];
}

const TIERS = [0, 200, 500, 1000]; // Bronze, Silver, Gold, Platinum demo

function nextTierInfo(points: number) {
  const next = TIERS.find((t) => t > points);
  const current = [...TIERS].reverse().find((t) => t <= points) ?? 0;
  return { current, next, remain: next ? Math.max(0, next - points) : 0 };
}

function computeStreakISO(dates: string[]) {
  // count consecutive days including today if a record exists
  const set = new Set(dates.map((d) => new Date(d).toDateString()));
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const dt = new Date();
    dt.setDate(dt.getDate() - i);
    if (set.has(dt.toDateString())) streak++;
    else break;
  }
  return streak;
}

const co2ToLaptopHours = (co2G: unknown) => money(Number(co2G) / 60, 1); // 60g/“laptop-hour” (demo)

export default function Wallet() {
  const { data, isLoading, error } = useLiveWallet();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10" />
        <Skeleton className="h-24" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (error || !data || !data.user) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold mb-2">Welcome to EcoRewards</h2>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          Please{" "}
          <Link to="/login" className="link">
            log in
          </Link>{" "}
          to view your wallet and start earning EcoPoints.
        </p>
        <div className="text-sm text-gray-500">
          Tip: In mock mode you can use <code>test@eco.local</code> with any password.
        </div>
      </div>
    );
  }

  const { user, recent } = data;

  // ✅ Coerce numerics safely so totals never NaN
  const totalsPlastic = recent.reduce((a, r) => a + Number(r?.plasticSavedG ?? 0), 0);
  const totalsCO2 = recent.reduce((a, r) => a + Number(r?.co2SavedG ?? 0), 0);

  const badges = computeBadges(Number(user.points ?? 0), totalsPlastic);
  const unlockedCount = badges.filter((b) => b.earned).length;
  const { current, next, remain } = nextTierInfo(Number(user.points ?? 0));
  const streak = computeStreakISO(recent.map((r) => r.createdAt));
  const hitNewBadge = unlockedCount > (user.badges?.length ?? 0);

  return (
    <div className="space-y-6">
      <Confetti fire={hitNewBadge} />

      {/* Top stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="EcoPoints" value={String(int(user.points))} />
        <StatCard
          label="Badges"
          value={String(unlockedCount)}
          sub={`${Math.max(0, badges.length - unlockedCount)} to go`}
        />
        <StatCard
          label="Plastic Saved"
          value={`${money(totalsPlastic / 1000, 2)} kg`}
          sub={`${int(totalsPlastic)} g total`}
        />
        <StatCard
          label="CO₂ Avoided"
          value={`${money(totalsCO2 / 1000, 2)} kg`}
          sub={`${co2ToLaptopHours(totalsCO2)} laptop-hours ⚡`}
        />
      </section>

      {/* Progress to next tier */}
      <section className="card space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Progress to next tier</div>
          <div className="text-sm text-gray-500">
            {next ? `${remain} pts to ${next}` : "Max tier reached 🎉"}
          </div>
        </div>
        <ProgressBar
          value={next ? Number(user.points ?? 0) - current : 1}
          max={next ? next - current : 1}
        />
      </section>

      {/* Streak */}
      <section className="card flex items-center justify-between">
        <div>
          <div className="font-semibold">Refill Streak</div>
          <div className="text-sm text-gray-500">Consecutive days with at least one refill</div>
        </div>
        <div className="text-2xl font-bold">{int(streak)}</div>
      </section>

      {/* Badges */}
      <section className="space-y-2">
        <h2 className="font-semibold text-lg">Badges</h2>
        <BadgeGrid badges={badges} />
      </section>

      <section className="card flex items-center justify-between">
        <div>
          <div className="font-semibold">Use your points</div>
          <div className="text-sm text-gray-500">100 pts → free 250ml refill • 200 pts → badge unlock</div>
        </div>
        <Link to="/scan" className="btn">
          Scan to earn
        </Link>
      </section>

      {/* Recent activity with SGD price (with 2 mock samples if empty) */}
<section className="space-y-2">
  <h2 className="font-semibold text-lg">Recent Activity</h2>

  {/*
    Mock samples (used only when recent.length === 0)
    Adjust values if you like.
  */}
  {(() => {
    const now = Date.now();
    const sampleRecent = [
      {
        id: "mock_1",
        brand: "EcoPure",
        productId: "shampoo-500",
        volumeMl: 500,
        points: Math.floor(500 / 25),   // 1 pt per 25ml => 20
        plasticSavedG: 12,              // demo factor (500ml ≈ 12g)
        co2SavedG: Math.round(12 * 3.2),// ≈ 38g
        priceSgd: 2.5,                  // with 0.005/ML
        createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
      },
      {
        id: "mock_2",
        brand: "GreenLeaf",
        productId: "detergent-1000",
        volumeMl: 1000,
        points: Math.floor(1000 / 25),  // 40
        plasticSavedG: 24,              // demo factor (1L ≈ 24g)
        co2SavedG: Math.round(24 * 3.2),// ≈ 77g
        priceSgd: 5.0,                  // with 0.005/ML
        createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      },
    ];

    // Fallback helpers if you don't already have them in scope
    const moneyFmt = (n: number, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : "0.00");
    const intFmt = (n: number) => Math.round(Number(n) || 0);

    const items = (recent.length ? recent : sampleRecent).slice(0, 8);

    return (
      <div className="grid gap-3">
        {items.map((r: any) => {
          const brand = r?.brand ?? "";
          const productId = r?.productId ?? "—";
          const volumeMl = Number(r?.volumeMl ?? 0);
          const points = Number(r?.points ?? 0);
          const plasticG = Number(r?.plasticSavedG ?? 0);
          const co2G = Number(r?.co2SavedG ?? 0);
          const priceSgd = r?.priceSgd;
          const priceStr = Number.isFinite(Number(priceSgd))
            ? `S$${moneyFmt(Number(priceSgd), 2)}`
            : "S$—";

          return (
            <div key={r.id} className="card flex items-center justify-between">
              {/* Left: brand pill first, then product + volume, then datetime */}
              <div>
                <div className="font-medium flex items-center flex-wrap gap-2">
                  {brand && (
                    <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 font-semibold text-sm">
                      {brand}
                    </span>
                  )}
                  <span>
                    {productId} • {intFmt(volumeMl)}ml
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(r.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Right: points + impact + price */}
              <div className="text-right">
                <div className="font-semibold text-green-600">+{intFmt(points)} pts</div>
                <div className="text-xs text-gray-500">
                  {intFmt(plasticG)}g plastic • {moneyFmt(co2G / 1000, 2)} kg CO₂ • {priceStr}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  })()}

  {recent.length === 0 && (
    <div className="text-gray-500">
      (Showing demo samples) — Scan a QR to record your first refill.
    </div>
  )}
</section>

    </div>
  );
}
