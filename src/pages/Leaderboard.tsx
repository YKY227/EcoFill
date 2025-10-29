// src/pages/Leaderboard.tsx
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/api/endpoints";
import { qk } from "@/api/queryKeys";
import Skeleton from "@/ui/Skeleton";
import { useLiveWallet } from "@/hooks/useLiveWallet";

type Row = {
  rank: number;
  user: string;
  points: number;
  // Optional fields (mock/backends may add later)
  plasticSavedG?: number;
  co2SavedG?: number;
};

function Medal({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-2xl" title="Gold">🥇</span>;
  if (rank === 2) return <span className="text-2xl" title="Silver">🥈</span>;
  if (rank === 3) return <span className="text-2xl" title="Bronze">🥉</span>;
  return <span className="w-6 inline-block text-center">{rank}</span>;
}

export default function Leaderboard() {
  const { data: lb, isLoading } = useQuery({ queryKey: qk.leaderboard, queryFn: endpoints.getLeaderboard });
  const { data: wallet } = useLiveWallet();

  const youName = wallet?.user?.name?.trim() ?? "";
  const youEmail = wallet?.user?.email?.trim() ?? "";

  const rows = useMemo<Row[]>(() => (lb ?? []) as Row[], [lb]);

  const leaderPoints = rows.length > 0 ? rows[0].points : 0;

  const showPlasticCol = rows.some(r => typeof r.plasticSavedG === "number");

  const isYou = (row: Row) => {
    const uname = row.user?.trim().toLowerCase();
    return (
      uname === "you" ||
      (!!youName && uname === youName.toLowerCase()) ||
      (!!youEmail && uname === youEmail.toLowerCase())
    );
  };

  if (isLoading || !rows.length) return <Skeleton className="h-40" />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Leaderboard</h1>

      {/* Desktop/table view */}
      <div className="card overflow-x-auto hidden sm:block">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500">
              <th className="py-2 pr-3">Rank</th>
              <th className="py-2 pr-3">User</th>
              <th className="py-2 pr-3">Points</th>
              {showPlasticCol && <th className="py-2 pr-3">Plastic Saved</th>}
              <th className="py-2">Gap</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const gap = Math.max(0, leaderPoints - row.points);
              const you = isYou(row);

              return (
                <tr
                  key={`${row.rank}-${row.user}`}
                  className={`border-t border-gray-100 dark:border-gray-800 ${
                    you ? "bg-green-50/60 dark:bg-green-900/20" : ""
                  }`}
                >
                  <td className="py-3 pr-3"><Medal rank={row.rank} /></td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      {/* Avatar initial */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold
                        ${you ? "bg-green-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100"}`}>
                        {row.user?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                      <div className="font-medium">
                        {row.user} {you && <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-800">You</span>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3 font-semibold">{row.points}</td>
                  {showPlasticCol && (
                    <td className="py-3 pr-3">
                      {typeof row.plasticSavedG === "number" ? `${(row.plasticSavedG / 1000).toFixed(2)} kg` : "—"}
                    </td>
                  )}
                  <td className="py-3">
                    {row.rank === 1 ? (
                      <span className="text-xs text-gray-500">Leader</span>
                    ) : (
                      <span className="text-xs text-gray-500">{gap} pts behind</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile/card view */}
      <div className="grid gap-3 sm:hidden">
        {rows.map((row) => {
          const you = isYou(row);
          const gap = Math.max(0, leaderPoints - row.points);
          return (
            <div
              key={`m-${row.rank}-${row.user}`}
              className={`card flex items-center justify-between ${you ? "bg-green-50/60 dark:bg-green-900/20" : ""}`}
            >
              <div className="flex items-center gap-3">
                <Medal rank={row.rank} />
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    {row.user} {you && <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-800">You</span>}
                  </div>
                  <div className="text-xs text-gray-500">
                    {row.rank === 1 ? "Leader" : `${gap} pts behind`}
                    {showPlasticCol && typeof row.plasticSavedG === "number" && (
                      <> • {(row.plasticSavedG / 1000).toFixed(2)} kg plastic</>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">{row.points} pts</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
