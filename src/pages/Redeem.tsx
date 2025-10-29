// src/pages/Redeem.tsx
import { useRewards } from "@/hooks/useRewards";
import { useLiveWallet } from "@/hooks/useLiveWallet";
import { endpoints } from "@/api/endpoints";
import { qk } from "@/api/queryKeys";
import { useToast } from "@/ui/Toast";
import Skeleton from "@/ui/Skeleton";
import Confetti from "@/ui/Confetti";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

export default function Redeem() {
  const { rewards } = useRewards();
  const { data, isLoading } = useLiveWallet();
  const qc = useQueryClient();
  const toast = useToast();
  const [celebrate, setCelebrate] = useState(false);

  const points = data?.user?.points ?? 0;

  const redeem = useMutation({
    mutationFn: (rewardId: string) => endpoints.redeemReward(rewardId),
    onSuccess: (_res, _id) => {
      toast?.push("🎉 Redeemed successfully!");
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 1800);
      // refresh wallet balance
      qc.invalidateQueries({ queryKey: qk.wallet });
    },
    onError: (err: any) => {
      toast?.push(err?.message || "Redemption failed");
    }
  });

  const grid = useMemo(() => {
    return rewards.map(r => {
      const short = r.description;
      const locked = points < r.pointsRequired;
      const need = Math.max(0, r.pointsRequired - points);
      return { ...r, short, locked, need };
    });
  }, [rewards, points]);

  if (isLoading || !data?.user) {
    return <Skeleton className="h-40" />;
  }

  return (
    <div className="space-y-6">
      <Confetti fire={celebrate} />

      {/* Balance header */}
      <section className="card flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Your EcoPoints</div>
        </div>
        <div className="text-2xl font-bold">{points}</div>
      </section>

      {/* Catalog */}
      <section className="space-y-2">
        <h1 className="text-xl font-semibold">Redeem EcoPoints</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {grid.map(item => (
            <div key={item.id} className={`card relative`}>
              {/* (optional) image */}
              {item.image ? (
                <img src={item.image} alt={item.title} className="w-full h-32 object-cover rounded-xl mb-3" />
              ) : (
                <div className="h-32 rounded-xl bg-gray-100 dark:bg-gray-800 mb-3 flex items-center justify-center text-4xl">
                  {item.category === "Voucher" ? "🎟️" : item.category === "Refill" ? "🧴" : item.category === "Merch" ? "👜" : "🎫"}
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.short}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Requires</div>
                  <div className="font-bold">{item.pointsRequired} pts</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-gray-500">{item.valueSgd ? `~ S$${item.valueSgd.toFixed(2)}` : " "}</div>
                {item.locked ? (
                  <button className="btn-secondary opacity-70 cursor-not-allowed">
                    Need {item.need} more
                  </button>
                ) : (
                  <button
                    className="btn"
                    onClick={() => redeem.mutate(item.id)}
                    disabled={redeem.isPending}
                  >
                    {redeem.isPending ? "Processing..." : "Redeem"}
                  </button>
                )}
              </div>

              {item.locked && (
                <div className="absolute inset-0 rounded-2xl bg-white/50 dark:bg-black/30 pointer-events-none" />
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
